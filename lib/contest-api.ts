import { ensureSupabase } from './supabase'
import type { 
  Contest, 
  ContestSubmission, 
  Judge, 
  JudgeScore,
  ContestStatus,
  SubmissionStatus 
} from '@/types/contest'

export class ContestAPI {
  
  // ===============================
  // 공모전 관리 (Contest Management)
  // ===============================
  
  /**
   * 모든 공모전 조회
   */
  static async getAllContests(params?: {
    status?: ContestStatus
    category?: string
    limit?: number
    offset?: number
  }) {
    const supabase = ensureSupabase()
    let query = supabase
      .from('contests')
      .select(`
        *,
        judges:contest_judges(
          judge_id,
          judges(*)
        ),
        submissions:contest_submissions(count)
      `)
      .order('created_at', { ascending: false })

    if (params?.status) {
      query = query.eq('status', params.status)
    }

    if (params?.category) {
      query = query.contains('category', [params.category])
    }

    if (params?.limit) {
      query = query.limit(params.limit)
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Contest[]
  }

  /**
   * 공모전 상세 조회
   */
  static async getContestById(id: string) {
    const supabase = ensureSupabase()
    const { data, error } = await supabase
      .from('contests')
      .select(`
        *,
        judges:contest_judges(
          judge_id,
          judges(*)
        ),
        submissions:contest_submissions(
          count,
          status
        ),
        awards:contest_awards(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Contest
  }

  /**
   * 공모전 생성
   */
  static async createContest(contest: Omit<Contest, 'id' | 'createdAt' | 'updatedAt'>) {
    const supabase = ensureSupabase()
    const { data, error } = await supabase
      .from('contests')
      .insert(contest)
      .select()
      .single()

    if (error) throw error
    return data as Contest
  }

  /**
   * 공모전 수정
   */
  static async updateContest(id: string, updates: Partial<Contest>) {
    const supabase = ensureSupabase()
    const { data, error } = await supabase
      .from('contests')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Contest
  }

  /**
   * 공모전 삭제
   */
  static async deleteContest(id: string) {
    const supabase = ensureSupabase()
    const { error } = await supabase
      .from('contests')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // ===============================
  // 출품 관리 (Submission Management)
  // ===============================

  /**
   * 공모전별 출품작 조회
   */
  static async getContestSubmissions(contestId: string, params?: {
    status?: SubmissionStatus
    judgeId?: string
    limit?: number
    offset?: number
  }) {
    const supabase = ensureSupabase()
    let query = supabase
      .from('contest_submissions')
      .select(`
        *,
        contest:contests(*),
        judging_scores:judge_scores(*)
      `)
      .eq('contest_id', contestId)
      .order('submitted_at', { ascending: false })

    if (params?.status) {
      query = query.eq('status', params.status)
    }

    if (params?.limit) {
      query = query.limit(params.limit)
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data as ContestSubmission[]
  }

  /**
   * 출품작 제출
   */
  static async submitArtwork(submission: Omit<ContestSubmission, 'id' | 'submittedAt' | 'updatedAt'>) {
    const supabase = ensureSupabase()
    const { data, error } = await supabase
      .from('contest_submissions')
      .insert({
        ...submission,
        submitted_at: new Date(),
        status: 'submitted'
      })
      .select()
      .single()

    if (error) throw error
    return data as ContestSubmission
  }

  /**
   * 출품작 수정
   */
  static async updateSubmission(id: string, updates: Partial<ContestSubmission>) {
    const supabase = ensureSupabase()
    const { data, error } = await supabase
      .from('contest_submissions')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as ContestSubmission
  }

  /**
   * 결제 상태 업데이트
   */
  static async updatePaymentStatus(submissionId: string, paymentInfo: ContestSubmission['payment']) {
    const supabase = ensureSupabase()
    const { data, error } = await supabase
      .from('contest_submissions')
      .update({ 
        payment: paymentInfo,
        updated_at: new Date() 
      })
      .eq('id', submissionId)
      .select()
      .single()

    if (error) throw error
    return data as ContestSubmission
  }

  // ===============================
  // 심사 관리 (Judging Management)
  // ===============================

  /**
   * 심사위원별 배정된 출품작 조회
   */
  static async getJudgeAssignments(judgeId: string, contestId: string) {
    const supabase = ensureSupabase()
    const { data, error } = await supabase
      .from('contest_submissions')
      .select(`
        *,
        contest:contests(*),
        judging_scores:judge_scores!inner(
          score,
          comment,
          scored_at
        )
      `)
      .eq('contest_id', contestId)
      .eq('judge_scores.judge_id', judgeId)
      .order('submitted_at', { ascending: false })

    if (error) throw error
    return data as ContestSubmission[]
  }

  /**
   * 심사 점수 제출
   */
  static async submitJudgeScore(score: Omit<JudgeScore, 'scoredAt'>) {
    const supabase = ensureSupabase()
    const { data, error } = await supabase
      .from('judge_scores')
      .insert({
        ...score,
        scored_at: new Date()
      })
      .select()
      .single()

    if (error) throw error
    return data as JudgeScore
  }

  /**
   * 심사 결과 집계
   */
  static async calculateJudgingResults(contestId: string) {
    const supabase = ensureSupabase()
    const { data: scores, error: scoresError } = await supabase
      .from('judge_scores')
      .select(`
        *,
        submission:contest_submissions!inner(
          id,
          contest_id,
          title,
          artist_name
        )
      `)
      .eq('submission.contest_id', contestId)

    if (scoresError) throw scoresError

    // 출품작별 점수 집계
    const submissionScores = new Map<string, {
      submissionId: string
      scores: JudgeScore[]
      averageScore: number
      totalScore: number
      judgeCount: number
    }>()

    scores?.forEach(score => {
      const submissionId = score.submission.id
      if (!submissionScores.has(submissionId)) {
        submissionScores.set(submissionId, {
          submissionId,
          scores: [],
          averageScore: 0,
          totalScore: 0,
          judgeCount: 0
        })
      }

      const submission = submissionScores.get(submissionId)!
      submission.scores.push(score)
      submission.totalScore += score.score
      submission.judgeCount = submission.scores.length
      submission.averageScore = submission.totalScore / submission.judgeCount
    })

    // 순위 결정
    const results = Array.from(submissionScores.values())
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((result, index) => {
        const resultWithRank = result as typeof result & { rank: number }
        resultWithRank.rank = index + 1
        return resultWithRank
      })

    return results
  }

  // ===============================
  // 통계 및 분석 (Statistics & Analytics)
  // ===============================

  /**
   * 공모전 통계 조회
   */
  static async getContestStatistics(contestId: string) {
    const supabase = ensureSupabase()
    
    // 기본 통계
    const [
      submissionsResult,
      judgeScoresResult,
      demographicsResult,
      categoriesResult
    ] = await Promise.all([
      supabase
        .from('contest_submissions')
        .select('*')
        .eq('contest_id', contestId),
      supabase
        .from('judge_scores')
        .select('*, submission:contest_submissions!inner(contest_id)')
        .eq('submission.contest_id', contestId),
      supabase
        .from('contest_submissions')
        .select('artist_nationality, artist_age_group')
        .eq('contest_id', contestId),
      supabase
        .from('contest_submissions')
        .select('category')
        .eq('contest_id', contestId)
    ])

    const submissions = submissionsResult.data || []
    const judgeScores = judgeScoresResult.data || []
    const demographics = demographicsResult.data || []
    const categories = categoriesResult.data || []

    return {
      totalSubmissions: submissions.length,
      submissionsByStatus: submissions.reduce((acc, sub) => {
        acc[sub.status] = (acc[sub.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      averageScore: judgeScores.length > 0 
        ? judgeScores.reduce((sum, score) => sum + score.score, 0) / judgeScores.length 
        : 0,
      judgeParticipation: judgeScores.length,
      demographicBreakdown: this.aggregateNationalities(demographics),
      categoryDistribution: this.aggregateCategories(categories)
    }
  }

  /**
   * 수익 통계 조회
   */
  static async getRevenueStatistics(contestId: string) {
    const supabase = ensureSupabase()
    const { data, error } = await supabase
      .from('contest_submissions')
      .select('payment')
      .eq('contest_id', contestId)
      .not('payment', 'is', null)

    if (error) throw error

    const totalRevenue = data?.reduce((total, submission) => {
      return total + ((submission.payment as any)?.amount || 0)
    }, 0) || 0

    return {
      totalRevenue,
      paidSubmissions: data?.length || 0,
      averageSubmissionFee: data?.length ? totalRevenue / data.length : 0
    }
  }

  // ===============================
  // 유틸리티 메서드 (Utility Methods)
  // ===============================

  private static aggregateCategories(data: any[]) {
    return data.reduce((acc, item) => {
      const category = item.category || 'Unknown'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private static aggregateNationalities(data: any[]) {
    return data.reduce((acc, item) => {
      const nationality = item.artist_nationality || 'Unknown'
      acc[nationality] = (acc[nationality] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
} 
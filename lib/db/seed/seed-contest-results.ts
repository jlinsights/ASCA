import { db } from '@/lib/db'
import { contestResults } from '@/lib/db/schema'

type AwardCategory =
  | 'grand_prize'
  | 'top_excellence'
  | 'excellence'
  | 'five_script'
  | 'three_script'
  | 'special'
  | 'selected'

interface Winner {
  name: string
  script: string
  title: string
  sub?: string
}

interface YearData {
  year: number
  edition: string
  contestTitle: string
  categories: Record<AwardCategory, Winner[]>
}

const contestData: YearData[] = [
  {
    year: 2024,
    edition: '제21회',
    contestTitle: '제21회 대한민국 동양서예대전',
    categories: {
      grand_prize: [
        { name: '김서예', script: '해행초', title: '정법과 창신의 조화', sub: '전통서예' },
      ],
      top_excellence: [
        { name: '이묵향', script: '행서', title: '묵향의 정취', sub: '전통서예' },
        { name: '박문인', script: '초서', title: '현대의 서정', sub: '전통서예' },
      ],
      excellence: [
        { name: '정서법', script: '해서', title: '해서의 정수', sub: '전통서예' },
        { name: '한필묵', script: '예서', title: '고운 묵적', sub: '전통서예' },
        { name: '조서향', script: '전서', title: '금석의 울림', sub: '전통서예' },
        { name: '윤초연', script: '초서', title: '바람의 서체', sub: '전통서예' },
        { name: '강묵림', script: '행서', title: '송림의 운치', sub: '전통서예' },
      ],
      five_script: [],
      three_script: [{ name: '오서운', script: '해서', title: '천자문 중 발췌', sub: '전통서예' }],
      special: [
        { name: '오서운', script: '해서', title: '천자문 중 발췌', sub: '전통서예' },
        { name: '신묵연', script: '행서', title: '추사의 흔적', sub: '전통서예' },
        { name: '유한글', script: '한글서예', title: '훈민정음 서체 연구', sub: '현대서예' },
      ],
      selected: [
        { name: '차예림', script: '해서', title: '논어 중 발췌', sub: '전통서예' },
        { name: '임서정', script: '행서', title: '봄날의 서정', sub: '전통서예' },
      ],
    },
  },
  {
    year: 2023,
    edition: '제20회',
    contestTitle: '제20회 대한민국 동양서예대전',
    categories: {
      grand_prize: [{ name: '최한글', script: '전서', title: '천지자연', sub: '전통서예' }],
      top_excellence: [
        { name: '정묵림', script: '행서', title: '산수유정', sub: '전통서예' },
        { name: '이서향', script: '해서', title: '정법의 아름다움', sub: '전통서예' },
      ],
      excellence: [
        { name: '김동양', script: '초서', title: '달빛 아래 글씨', sub: '전통서예' },
        { name: '박예서', script: '예서', title: '한비자 발췌', sub: '전통서예' },
        { name: '한서연', script: '해서', title: '천자문 全篇', sub: '전통서예' },
      ],
      five_script: [],
      three_script: [],
      special: [
        { name: '윤서화', script: '행서', title: '시경 발췌', sub: '전통서예' },
        { name: '조한묵', script: '해서', title: '대학 서문', sub: '전통서예' },
      ],
      selected: [{ name: '강예림', script: '전서', title: '금석문 연구', sub: '전통서예' }],
    },
  },
  {
    year: 2022,
    edition: '제19회',
    contestTitle: '제19회 대한민국 동양서예대전',
    categories: {
      grand_prize: [{ name: '박묵향', script: '행서', title: '대풍가', sub: '전통서예' }],
      top_excellence: [
        { name: '김예서', script: '해서', title: '논어 학이편', sub: '전통서예' },
        { name: '이서정', script: '초서', title: '풍류의 자취', sub: '전통서예' },
      ],
      excellence: [
        { name: '한묵연', script: '예서', title: '예서의 기원', sub: '전통서예' },
        { name: '정서운', script: '전서', title: '고전의 여운', sub: '전통서예' },
      ],
      five_script: [],
      three_script: [],
      special: [],
      selected: [],
    },
  },
]

export async function seedContestResults() {
  console.log('🌱 Seeding contest results...')

  let totalSeeded = 0
  const categoryLabels: Record<AwardCategory, string> = {
    grand_prize: '대상',
    top_excellence: '최우수상',
    excellence: '우수상',
    five_script: '오체상',
    three_script: '삼체상',
    special: '특선',
    selected: '입선',
  }

  for (const yearData of contestData) {
    const categories = Object.entries(yearData.categories) as [AwardCategory, Winner[]][]
    let displayOrder = 0

    for (const [category, winners] of categories) {
      for (const winner of winners) {
        const id = `cr-${yearData.year}-${category}-${displayOrder}`
        await db
          .insert(contestResults)
          .values({
            id,
            year: yearData.year,
            edition: yearData.edition,
            contestType: 'oriental_calligraphy',
            contestTitle: yearData.contestTitle,
            awardCategory: category,
            awardSubCategory: winner.sub ?? categoryLabels[category],
            winnerName: winner.name,
            artworkTitle: winner.title,
            script: winner.script,
            displayOrder,
          })
          .onConflictDoUpdate({
            target: contestResults.id,
            set: {
              winnerName: winner.name,
              artworkTitle: winner.title,
              script: winner.script,
              awardSubCategory: winner.sub ?? categoryLabels[category],
            },
          })
        displayOrder++
        totalSeeded++
      }
    }
  }

  console.log(`✅ ${totalSeeded} contest results seeded`)
}

// 카카오 푸시 알림 유틸리티
// 공모전 마감 알림, 전시회 소식 등을 위한 서비스

import { kakaoSDK } from './kakao'

export interface NotificationTemplate {
  id: number
  title: string
  description: string
  type: 'contest_deadline' | 'exhibition_open' | 'artist_update' | 'general'
  templateArgs?: Record<string, any>
}

export interface NotificationSubscriber {
  userId: string
  kakaoId?: number
  email?: string
  preferences: {
    contestDeadlines: boolean
    exhibitionUpdates: boolean
    artistUpdates: boolean
    generalNews: boolean
  }
}

class KakaoNotificationService {
  private templates: Map<string, NotificationTemplate> = new Map()

  constructor() {
    this.initializeTemplates()
  }

  // 기본 템플릿 초기화
  private initializeTemplates() {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 1,
        title: '공모전 마감 임박 알림',
        description: '#{contest_name} 공모전이 #{days_left}일 후 마감됩니다.',
        type: 'contest_deadline',
        templateArgs: {
          contest_name: '제32회 동양서예협회 정기공모전',
          days_left: '3'
        }
      },
      {
        id: 2,
        title: '새로운 전시회 오픈',
        description: '#{exhibition_name} 전시회가 #{date}에 시작됩니다.',
        type: 'exhibition_open',
        templateArgs: {
          exhibition_name: '2024 신진작가 초대전',
          date: '2024년 3월 15일'
        }
      },
      {
        id: 3,
        title: '작가 소식 업데이트',
        description: '#{artist_name} 작가의 새로운 작품이 업로드되었습니다.',
        type: 'artist_update',
        templateArgs: {
          artist_name: '김서예'
        }
      },
      {
        id: 4,
        title: 'ASCA 소식',
        description: '#{title} - #{description}',
        type: 'general',
        templateArgs: {
          title: '협회 소식',
          description: '새로운 소식을 확인해보세요'
        }
      }
    ]

    defaultTemplates.forEach(template => {
      this.templates.set(template.type, template)
    })
  }

  // 공모전 마감 알림 발송
  async sendContestDeadlineNotification(
    subscribers: string[],
    contestName: string,
    daysLeft: number,
    contestUrl?: string
  ): Promise<boolean> {
    try {
      const template = this.templates.get('contest_deadline')
      if (!template) {
        throw new Error('Contest deadline template not found')
      }

      const templateArgs = {
        contest_name: contestName,
        days_left: daysLeft.toString(),
        contest_url: contestUrl || ''
      }

      const success = await kakaoSDK.sendPushNotification(
        subscribers,
        template.id,
        templateArgs
      )

      if (success) {
        console.log(`✅ Contest deadline notification sent to ${subscribers.length} users`)
      }

      return success
    } catch (error) {
      console.error('❌ Failed to send contest deadline notification:', error)
      return false
    }
  }

  // 전시회 오픈 알림 발송
  async sendExhibitionOpenNotification(
    subscribers: string[],
    exhibitionName: string,
    openDate: string,
    location?: string,
    exhibitionUrl?: string
  ): Promise<boolean> {
    try {
      const template = this.templates.get('exhibition_open')
      if (!template) {
        throw new Error('Exhibition open template not found')
      }

      const templateArgs = {
        exhibition_name: exhibitionName,
        date: openDate,
        location: location || '',
        exhibition_url: exhibitionUrl || ''
      }

      const success = await kakaoSDK.sendPushNotification(
        subscribers,
        template.id,
        templateArgs
      )

      if (success) {
        console.log(`✅ Exhibition open notification sent to ${subscribers.length} users`)
      }

      return success
    } catch (error) {
      console.error('❌ Failed to send exhibition open notification:', error)
      return false
    }
  }

  // 작가 업데이트 알림 발송
  async sendArtistUpdateNotification(
    subscribers: string[],
    artistName: string,
    updateType: 'new_artwork' | 'profile_update' | 'exhibition',
    updateDetails?: string,
    artistUrl?: string
  ): Promise<boolean> {
    try {
      const template = this.templates.get('artist_update')
      if (!template) {
        throw new Error('Artist update template not found')
      }

      const updateTypeText = {
        'new_artwork': '새로운 작품',
        'profile_update': '프로필 업데이트',
        'exhibition': '전시 참여'
      }

      const templateArgs = {
        artist_name: artistName,
        update_type: updateTypeText[updateType],
        update_details: updateDetails || '',
        artist_url: artistUrl || ''
      }

      const success = await kakaoSDK.sendPushNotification(
        subscribers,
        template.id,
        templateArgs
      )

      if (success) {
        console.log(`✅ Artist update notification sent to ${subscribers.length} users`)
      }

      return success
    } catch (error) {
      console.error('❌ Failed to send artist update notification:', error)
      return false
    }
  }

  // 일반 소식 알림 발송
  async sendGeneralNotification(
    subscribers: string[],
    title: string,
    description: string,
    url?: string
  ): Promise<boolean> {
    try {
      const template = this.templates.get('general')
      if (!template) {
        throw new Error('General notification template not found')
      }

      const templateArgs = {
        title,
        description,
        url: url || ''
      }

      const success = await kakaoSDK.sendPushNotification(
        subscribers,
        template.id,
        templateArgs
      )

      if (success) {
        console.log(`✅ General notification sent to ${subscribers.length} users`)
      }

      return success
    } catch (error) {
      console.error('❌ Failed to send general notification:', error)
      return false
    }
  }

  // 예약 알림 설정 (공모전 마감 3일 전, 1일 전)
  async scheduleContestReminders(
    contestId: string,
    contestName: string,
    deadlineDate: Date,
    subscribers: string[]
  ): Promise<boolean> {
    try {
      const now = new Date()
      const deadline = new Date(deadlineDate)
      const timeDiff = deadline.getTime() - now.getTime()
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24))

      // 3일 전 알림
      if (daysLeft === 3) {
        await this.sendContestDeadlineNotification(
          subscribers,
          contestName,
          3,
          `/contests/${contestId}`
        )
      }

      // 1일 전 알림
      if (daysLeft === 1) {
        await this.sendContestDeadlineNotification(
          subscribers,
          contestName,
          1,
          `/contests/${contestId}`
        )
      }

      // 당일 알림 (마감 6시간 전)
      if (daysLeft === 0) {
        const hoursLeft = Math.ceil(timeDiff / (1000 * 3600))
        if (hoursLeft <= 6 && hoursLeft > 0) {
          await this.sendContestDeadlineNotification(
            subscribers,
            contestName,
            0,
            `/contests/${contestId}`
          )
        }
      }

      return true
    } catch (error) {
      console.error('❌ Failed to schedule contest reminders:', error)
      return false
    }
  }

  // 구독자 관리
  async subscribeToNotifications(
    userId: string,
    kakaoId: number,
    preferences: NotificationSubscriber['preferences']
  ): Promise<boolean> {
    try {
      // 실제 구현에서는 데이터베이스에 저장
      const subscriber: NotificationSubscriber = {
        userId,
        kakaoId,
        preferences
      }

      // Supabase나 다른 DB에 저장하는 로직
      console.log('✅ User subscribed to notifications:', subscriber)
      return true
    } catch (error) {
      console.error('❌ Failed to subscribe user to notifications:', error)
      return false
    }
  }

  async unsubscribeFromNotifications(userId: string): Promise<boolean> {
    try {
      // 실제 구현에서는 데이터베이스에서 제거
      console.log('✅ User unsubscribed from notifications:', userId)
      return true
    } catch (error) {
      console.error('❌ Failed to unsubscribe user from notifications:', error)
      return false
    }
  }

  // 알림 설정 업데이트
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationSubscriber['preferences']>
  ): Promise<boolean> {
    try {
      // 실제 구현에서는 데이터베이스 업데이트
      console.log('✅ Notification preferences updated:', { userId, preferences })
      return true
    } catch (error) {
      console.error('❌ Failed to update notification preferences:', error)
      return false
    }
  }

  // 템플릿 관리
  addTemplate(type: string, template: NotificationTemplate): void {
    this.templates.set(type, template)
  }

  getTemplate(type: string): NotificationTemplate | undefined {
    return this.templates.get(type)
  }

  getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values())
  }
}

// 싱글톤 인스턴스
export const kakaoNotificationService = new KakaoNotificationService()

// 편의 함수들
export const sendContestDeadlineAlert = (
  subscribers: string[],
  contestName: string,
  daysLeft: number,
  contestUrl?: string
) => kakaoNotificationService.sendContestDeadlineNotification(subscribers, contestName, daysLeft, contestUrl)

export const sendExhibitionAlert = (
  subscribers: string[],
  exhibitionName: string,
  openDate: string,
  location?: string,
  exhibitionUrl?: string
) => kakaoNotificationService.sendExhibitionOpenNotification(subscribers, exhibitionName, openDate, location, exhibitionUrl)

export const sendArtistAlert = (
  subscribers: string[],
  artistName: string,
  updateType: 'new_artwork' | 'profile_update' | 'exhibition',
  updateDetails?: string,
  artistUrl?: string
) => kakaoNotificationService.sendArtistUpdateNotification(subscribers, artistName, updateType, updateDetails, artistUrl)

export const scheduleContestReminders = (
  contestId: string,
  contestName: string,
  deadlineDate: Date,
  subscribers: string[]
) => kakaoNotificationService.scheduleContestReminders(contestId, contestName, deadlineDate, subscribers)

export default kakaoNotificationService 
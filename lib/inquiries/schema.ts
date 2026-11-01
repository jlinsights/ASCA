import { z } from 'zod'

/**
 * 문의서 접수 — 서버가 믿는 단 하나의 검증 (2026-11-01).
 * 길이 제한은 supabase/migrations/20261101120000_inquiries.sql 의 CHECK 와 같다.
 * 화면(app/contact/_components/inquiry-data.ts)의 검증은 안내용이고, 여기서 다시 막는다.
 */

export const INQUIRY_TOPIC_IDS = [
  'artwork',
  'commission',
  'exhibition',
  'academy',
  'membership',
  'other',
] as const
export type InquiryTopicId = (typeof INQUIRY_TOPIC_IDS)[number]

/** 예산·일정 칸을 받는 용건 — 견적이 필요한 일. 나머지 용건의 plan 은 버린다 */
export const PLAN_TOPICS: ReadonlySet<InquiryTopicId> = new Set([
  'artwork',
  'commission',
  'exhibition',
])

export const INQUIRY_LIMITS = {
  name: 100,
  email: 254,
  phone: 40,
  subject: 200,
  plan: 300,
  message: 5000,
} as const

/** 문의 요청 본문 상한 — 칸 제한(내용 5,000자 등)을 넉넉히 덮는 크기 */
export const MAX_INQUIRY_BYTES = 32 * 1024

export const INQUIRY_STATUSES = ['new', 'answered', 'closed'] as const
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]

const optionalText = (max: number) =>
  z
    .string()
    .max(max * 2) // 공백을 다듬기 전 여유. 다듬은 뒤 다시 잰다
    .optional()
    .transform(value => value?.trim() || null)
    .refine(value => value === null || value.length <= max)

/** 요청 본문 — website 는 사람에게 안 보이는 덫 칸(honeypot) */
export const inquirySubmissionSchema = z
  .object({
    topic: z.enum(INQUIRY_TOPIC_IDS),
    name: z
      .string()
      .transform(value => value.trim())
      .pipe(z.string().min(1).max(INQUIRY_LIMITS.name)),
    email: optionalText(INQUIRY_LIMITS.email)
      .transform(value => value?.toLowerCase() ?? null)
      .refine(value => value === null || z.string().email().safeParse(value).success),
    phone: optionalText(INQUIRY_LIMITS.phone),
    subject: optionalText(INQUIRY_LIMITS.subject),
    plan: optionalText(INQUIRY_LIMITS.plan),
    message: z
      .string()
      .transform(value => value.trim())
      .pipe(z.string().min(1).max(INQUIRY_LIMITS.message)),
    language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko'),
    consent: z.literal(true),
    website: z.string().max(200).optional(),
  })
  .strict()
  .refine(value => value.email !== null || value.phone !== null, { path: ['email'] })

export type InquirySubmission = z.infer<typeof inquirySubmissionSchema>

/** DB 에 넣을 행 — 덫 칸·동의는 저장하지 않고, 견적이 아닌 용건의 plan 은 버린다 */
export function toInquiryRow(input: InquirySubmission) {
  return {
    topic: input.topic,
    name: input.name,
    email: input.email,
    phone: input.phone,
    subject: input.subject,
    plan: PLAN_TOPICS.has(input.topic) ? input.plan : null,
    message: input.message,
    language: input.language,
  }
}

/** 관리자의 처리 — 상태와 메모 */
export const inquiryDecisionSchema = z
  .object({
    status: z.enum(INQUIRY_STATUSES),
    note: z.string().trim().max(2000).optional(),
  })
  .strict()

export const adminInquiryQuerySchema = z.object({
  status: z.enum([...INQUIRY_STATUSES, 'all']).default('new'),
})

export const ADMIN_INQUIRY_LIMIT = 200
export const ADMIN_INQUIRY_COLUMNS =
  'id,topic,name,email,phone,subject,plan,message,language,status,staff_note,handled_at,created_at'

export interface AdminInquiry {
  id: string
  topic: InquiryTopicId
  name: string
  email: string | null
  phone: string | null
  subject: string | null
  plan: string | null
  message: string
  language: 'ko' | 'en' | 'ja' | 'zh'
  status: InquiryStatus
  staff_note: string | null
  handled_at: string | null
  created_at: string
}

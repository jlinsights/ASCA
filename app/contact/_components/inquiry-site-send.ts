import type { Language } from '@/lib/i18n'
import type { InquiryDraft } from './inquiry-data'

/**
 * 문의를 사이트 접수함(/api/inquiries)에 보낸다.
 * 201 과 { ok: true } 를 받았을 때만 'sent' — 그 밖엔 'failed' 로 두고 화면이 메일·카카오톡을 권한다.
 * 덫 칸(website)은 사람이 채우지 않는 칸이라 화면 값 그대로 보낸다.
 */
export async function postInquiry(
  draft: InquiryDraft,
  language: Language,
  website: string
): Promise<'sent' | 'failed'> {
  try {
    const response = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: draft.topic,
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        subject: draft.subject,
        plan: draft.plan,
        message: draft.message,
        language,
        consent: true,
        website,
      }),
    })
    if (response.status !== 201) return 'failed'
    const body = (await response.json().catch(() => null)) as { ok?: boolean } | null
    return body?.ok === true ? 'sent' : 'failed'
  } catch {
    return 'failed'
  }
}

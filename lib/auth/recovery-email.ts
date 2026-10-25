import { EMAIL, PHONE } from '../content/contact-info'

/** Keep the UI, local mail template and hosted Auth configuration in sync. */
export const RECOVERY_EMAIL_SUBJECT = '[동양서예협회] 비밀번호 새로 만들기'
export const RECOVERY_LINK_HOURS = 1

export function recoveryEmailTemplate() {
  return `<html lang="ko"><body style="font-family:sans-serif;font-size:17px;line-height:1.6;color:#14213d;background:#faf8f0;padding:24px">
<h1 style="font-size:26px">비밀번호 새로 만들기</h1>
<p>{{ if .Data.full_name }}{{ .Data.full_name }}님, {{ end }}안녕하세요. 동양서예협회입니다.</p>
<p>아래 버튼을 눌러 새 비밀번호를 만들어 주세요. 링크는 ${RECOVERY_LINK_HOURS}시간 동안 한 번만 사용할 수 있습니다.</p>
<p><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:16px 24px;background:#14213d;color:#fff">새 비밀번호 만들기</a></p>
<p>버튼이 열리지 않으면 아래 주소를 복사해 인터넷 주소창에 붙여 넣어 주세요.</p>
<p style="overflow-wrap:anywhere"><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>
<p>직접 요청하지 않으셨다면 이 메일을 무시하셔도 됩니다.</p>
<p>도움이 필요하시면 사무국 <a href="${PHONE.href}">${PHONE.display}</a> · <a href="mailto:${EMAIL}">${EMAIL}</a></p>
</body></html>`
}

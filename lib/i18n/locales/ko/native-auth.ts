// native-auth 화면 번역 (ko). 네 언어를 모으는 곳은 lib/i18n/translations/native-auth.ts 다.
const nativeAuth: Record<string, string> = {
  authNativeReturningTitle: '예전 홈페이지에서 쓰시던 비밀번호는 옮겨지지 않았습니다.',
  authNativeReturningSignup: '예전 홈페이지 회원이셨나요?',
  authNativeReturningBody:
    '새 홈페이지를 처음 이용하시면 계정 만들기를 먼저 진행해 주세요. 이미 새 계정을 만드셨다면 비밀번호 새로 만들기를 이용할 수 있습니다.',
  authNativeNewPassword: '비밀번호 새로 만들기',
  authNativeExisting:
    '이미 계정이 있는 이메일이라면 새로 가입하지 말고 비밀번호 새로 만들기를 이용해 주세요.',
  authNativeArtistLink:
    '이메일 확인 후 사무국에 작가 정보 연결을 요청해 주세요. 이름과 호를 알려 주시면 본인 확인 후 연결을 도와드립니다.',
  authNativeMailTitle: '안내 메일을 확인해 주세요',
  authNativeMailAddress:
    '받은편지함을 확인해 주세요. 주소를 잘못 쓰셨다면 아래에서 바꿀 수 있습니다.',
  authNativeMailSubject: '다음 제목의 메일을 찾으세요:',
  authNativeMailOpen: '메일 안의 ‘새 비밀번호 만들기’ 버튼을 누르세요.',
  authNativeMailExpiry:
    '링크는 1시간 동안 한 번만 사용할 수 있습니다. 메일을 요청한 브라우저에서 열어 주세요.',
  authNativeSignupMail:
    '가입 확인 메일의 버튼을 누르면 내 작가 공간으로 들어갑니다. 메일을 요청한 브라우저에서 열어 주세요.',
  authNativeMailMissing: '메일이 안 오나요?',
  authNativeSpam: '스팸함과 프로모션함도 확인해 주세요.',
  authNativeNaverSpam: '네이버: 메일의 전체 메뉴(≡) → 스팸메일함을 열어 확인하세요.',
  authNativeDaumSpam: '다음: 메일의 메뉴(≡) → 스팸편지함을 열어 확인하세요.',
  authNativeMailWait:
    '5분이 지나도 없으면 다시 보내기를 눌러 주세요. 다시 보내기는 60초 뒤부터 가능합니다.',
  authNativeSendAgain: '안내 메일 다시 보내기',
  authNativeChangeEmail: '이메일 주소 바꾸기',
  authNativeMailOffice:
    '등록한 주소가 기억나지 않거나 메일을 받지 못하면 아래 사무국으로 연락해 주세요.',
  authNativeTooSoon: '메일을 너무 자주 요청하셨습니다. 잠시 기다린 뒤 다시 눌러 주세요.',
  authNativeOffice: '사무국',
  authNativeHelp: '도움이 필요하시면 사무국으로 연락해 주세요.',
  authNativeShow: '보기',
  authNativeHide: '숨기기',
  authNativeEmailError: '이메일에 @와 주소가 모두 있는지 확인해 주세요. 예: artist@example.com',
  authNativePasswordRequired:
    '비밀번호를 입력해 주세요. 예전 비밀번호가 기억나지 않으면 비밀번호 새로 만들기를 이용하세요.',
  authNativePasswordUpdated:
    '비밀번호를 새로 만들었습니다. 로그인된 상태로 내 작가 공간에 들어왔습니다.',
  authNativeNameRequired: '사용하시는 이름을 입력해 주세요.',
  authNativeConsentRequired: '이용약관과 개인정보처리방침을 확인한 뒤 동의에 표시해 주세요.',
  authNativeMfaRecovery: '비밀번호를 변경하려면 먼저 2단계 확인을 마쳐 주세요.',
  authNativeSave: '저장',
  authNativeEmail: '이메일',
  authNativePassword: '비밀번호',
  authNativeConfirm: '비밀번호 확인',
  authNativeName: '이름',
  authNativeSignIn: '로그인',
  authNativeSignUp: '계정 만들기',
  authNativeForgot: '비밀번호를 잊으셨나요?',
  authNativeRecover: '비밀번호 재설정 메일 보내기',
  authNativeReset: '새 비밀번호 저장',
  authNativeResetTitle: '비밀번호 재설정',
  authNativeResetLede: '이메일로 받은 링크에서 새 비밀번호를 설정하세요.',
  authNativeForgotTitle: '비밀번호 새로 만들기',
  authNativeForgotLede:
    '새 홈페이지 계정을 만들 때 사용한 이메일을 입력해 주세요. 아직 계정을 만들지 않으셨다면 회원가입을 먼저 진행해 주세요.',
  authNativePasswordHint: '새 비밀번호는 12자 이상으로 입력하세요.',
  authNativeAgree: '이용약관과 개인정보처리방침을 확인하고 동의합니다.',
  authNativeMembership: '계정 가입과 협회 회원 자격·작가 등록은 별도 절차입니다.',
  authNativeBusy: '처리 중…',
  authNativeInvalid:
    '이메일 또는 비밀번호가 맞지 않습니다. 새 홈페이지가 처음이면 계정을 만들어 주세요. 이미 가입하셨다면 비밀번호 새로 만들기를 이용해 주세요.',
  authNativeUnavailable: '잠시 연결이 원활하지 않습니다. 1~2분 뒤 다시 눌러 주세요.',
  authNativeUnconfirmed:
    '가입 확인 메일의 링크를 아직 누르지 않으셨습니다. 확인 메일 다시 받기를 눌러 주세요.',
  authNativeEmailSent:
    '메일이 발송될 수 있는 계정이면 안내 메일을 보내드립니다. 메일함과 스팸함을 확인해 주세요.',
  authNativeMismatch: '두 비밀번호가 일치하지 않습니다.',
  authNativeCallback:
    '링크 사용 시간(1시간)이 지났거나 이미 사용한 링크입니다. 새 링크를 받아 주세요.',
  authNativeResend: '확인 메일 다시 받기',
  authNativeBack: '로그인으로 돌아가기',
  authNativeMfaTitle: '2단계 확인',
  authNativeMfaLede: '휴대전화 보안 앱에 표시된 6자리 숫자를 입력해 주세요.',
  authNativeMfaEnroll: '휴대전화 보안 앱 연결',
  authNativeMfaCode: '보안 앱의 6자리 숫자',
  authNativeMfaVerify: '6자리 숫자 확인',
  authNativeMfaScan: '휴대전화 보안 앱에서 QR 코드를 읽거나 아래 연결 키를 입력해 주세요.',
  authNativeMfaError: '코드를 확인하고 다시 시도해 주세요.',
  authNativeDenied: '이 계정에는 관리자 권한이 없습니다.',
  authNativeUnlinked: '연결된 작가 정보가 없습니다. 사무국에 작가 계정 연결을 요청해 주세요.',
  authNativeSessionError: '로그인 상태를 확인하지 못했습니다. 다시 시도해 주세요.',
  authNativeRetry: '다시 확인',
  authNativeAccount: '내 작가 공간',
  authNativeArchive: '작품 기록하기',
}

export default nativeAuth

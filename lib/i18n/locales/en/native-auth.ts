// native-auth 화면 번역 (en). 네 언어를 모으는 곳은 lib/i18n/translations/native-auth.ts 다.
const nativeAuth: Record<string, string> = {
  authNativeReturningTitle: 'Passwords from our previous website have not been transferred.',
  authNativeReturningSignup: 'Were you a member of our previous website?',
  authNativeReturningBody:
    'If this is your first visit to the new website, create an account first. If you already registered here, you can create a new password.',
  authNativeNewPassword: 'Create a new password',
  authNativeExisting:
    'If this email already has an account, create a new password instead of signing up again.',
  authNativeArtistLink:
    'After confirming your email, contact the office with your name and art name to request a link to your artist profile. The office will verify your identity before linking it.',
  authNativeMailTitle: 'Check your email for instructions',
  authNativeMailAddress: 'Check this inbox. You can correct the address below if needed.',
  authNativeMailSubject: 'Look for an email with this subject:',
  authNativeMailOpen: 'Select the “Create a new password” button in the email.',
  authNativeMailExpiry:
    'The link works once within one hour. Open it in the browser where you requested the email.',
  authNativeSignupMail:
    'Use the confirmation button in the email to enter your artist space. Open it in the browser where you requested the email.',
  authNativeMailMissing: 'Has the email not arrived?',
  authNativeSpam: 'Also check your spam and promotions folders.',
  authNativeNaverSpam: 'Naver Mail: open the full menu (≡), then 스팸메일함 (Spam).',
  authNativeDaumSpam: 'Daum Mail: open the menu (≡), then 스팸편지함 (Spam).',
  authNativeMailWait:
    'If it has not arrived after five minutes, send it again. Resending is available after 60 seconds.',
  authNativeSendAgain: 'Send instructions again',
  authNativeChangeEmail: 'Change email address',
  authNativeMailOffice:
    'If you cannot remember your registered address or receive the email, contact the office below.',
  authNativeTooSoon: 'You have requested emails too often. Wait a little and try again.',
  authNativeOffice: 'Association office',
  authNativeHelp: 'Contact the association office if you need help.',
  authNativeShow: 'Show',
  authNativeHide: 'Hide',
  authNativeEmailError:
    'Check that your email includes @ and the full address, for example artist@example.com.',
  authNativePasswordRequired:
    'Enter your password. If you do not remember it, choose Create a new password.',
  authNativePasswordUpdated: 'Your new password is saved. You are signed in to your artist space.',
  authNativeNameRequired: 'Enter the name you use.',
  authNativeConsentRequired:
    'Read the Terms of Service and Privacy Policy, then check the agreement box.',
  authNativeMfaRecovery: 'Complete two-factor verification before changing your password.',
  authNativeSave: 'Save',
  authNativeEmail: 'Email',
  authNativePassword: 'Password',
  authNativeConfirm: 'Confirm password',
  authNativeName: 'Name',
  authNativeSignIn: 'Sign in',
  authNativeSignUp: 'Create account',
  authNativeForgot: 'Forgot your password?',
  authNativeRecover: 'Send password reset email',
  authNativeReset: 'Save new password',
  authNativeResetTitle: 'Reset your password',
  authNativeResetLede: 'Set a new password using the link in your email.',
  authNativeForgotTitle: 'Recover your account',
  authNativeForgotLede:
    'Enter the email used for your new website account. If you have not created an account here yet, sign up first.',
  authNativePasswordHint: 'Use at least 12 characters for a new password.',
  authNativeAgree: 'I have read and agree to the Terms of Service and Privacy Policy.',
  authNativeMembership: 'An account does not grant association membership or an artist profile.',
  authNativeBusy: 'Please wait…',
  authNativeInvalid:
    'Your email or password does not match. Passwords from our previous website cannot be used here. Create an account if you have not registered here, or choose Create a new password if you have.',
  authNativeUnavailable: 'Authentication is unavailable. Please try again later.',
  authNativeUnconfirmed: 'Please verify your email first.',
  authNativeEmailSent:
    'If the account can receive this email, we will send instructions. Check your inbox and spam folder.',
  authNativeMismatch: 'The passwords do not match.',
  authNativeCallback: 'The verification link has expired or was already used. Request a new link.',
  authNativeResend: 'Resend verification email',
  authNativeBack: 'Back to sign in',
  authNativeMfaTitle: 'Two-factor verification',
  authNativeMfaLede: 'Enter a one-time code from your authenticator app.',
  authNativeMfaEnroll: 'Set up authenticator',
  authNativeMfaCode: 'Six-digit verification code',
  authNativeMfaVerify: 'Verify',
  authNativeMfaScan: 'Scan the QR code with your authenticator app, or enter the setup key below.',
  authNativeMfaError: 'Check the code and try again.',
  authNativeDenied: 'This account does not have administrator access.',
  authNativeUnlinked:
    'No artist profile is linked. Contact the office to link your artist account.',
  authNativeSessionError: 'We could not check your sign-in status. Please try again.',
  authNativeRetry: 'Try again',
  authNativeAccount: 'My artist space',
  authNativeArchive: 'Record artwork',
}

export default nativeAuth

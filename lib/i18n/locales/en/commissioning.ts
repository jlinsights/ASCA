// commissioning 화면 번역 (en) — /commissioning-application 위원 위촉 지원. 데이터 글자는 commissioning-copy.ts 의 commissioningDataStrings() 와 같아야 한다. 네 언어를 모으는 곳은 lib/i18n/translations/commissioning.ts 다.
// 수당·여비·식대·실적 인센티브의 금액은 ko 값과 같아야 한다.

const commissioning: Record<string, string> = {
  'cm.ui.heroTitle': 'Application for Juror & Committee Appointment',
  'cm.ui.heroLede':
    'We are seeking jurors, Steering Committee Members and Recruiting Committee Members to help run the Korea Oriental Calligraphy Grand Exhibition. Please check the qualifications, then send your application online.',
  'cm.ui.heroOnline': 'Fill in the online application',
  'cm.ui.heroRoles': 'View juror & committee qualifications',
  'cm.ui.factRoles': 'Roles',
  'cm.ui.factRolesValue': '{n} types',
  'cm.ui.factDecision': 'Appointment decided by',
  'cm.ui.factDecisionValue': 'Board of Directors resolution',
  'cm.ui.tocLabel': 'Jump to a section on this page',
  'cm.ui.tocRoles': 'Roles & qualifications',
  'cm.ui.tocProcess': 'Appointment steps',
  'cm.ui.tocPay': 'Allowances',
  'cm.ui.tocFairness': 'Fairness',
  'cm.ui.tocApply': 'Fill in the application',
  'cm.ui.tocContact': 'Contact',
  'cm.ui.cite': 'Basis',
  'cm.ui.newWindow': ' (new window)',
  'cm.ui.rolesEyebrow': 'Roles and qualifications',
  'cm.ui.rolesTitle': 'Three kinds of committee members',
  'cm.ui.rolesLede':
    'Jurors, Steering Committee Members and Recruiting Committee Members are appointed positions, not employment. Concurrent posts are allowed, and qualifications differ by role.',
  'cm.ui.qualifications': 'Qualifications',
  'cm.ui.processEyebrow': 'Appointment steps and term',
  'cm.ui.processTitle': 'From application to appointment',
  'cm.ui.processLede':
    'Committee members are appointed for each Grand Exhibition, and the term runs until the close of that Exhibition.',
  'cm.ui.payEyebrow': 'Committee allowances and fees',
  'cm.ui.payTitle': 'Allowances',
  'cm.ui.payLede':
    'Compensation is divided into allowances, travel expenses and performance incentives, according to the nature of the work. The amounts below are proposed amounts per person and are set according to the Association’s financial situation and internal regulations.',
  'cm.ui.colKind': 'Category',
  'cm.ui.colBasis': 'Basis (suggested amount per person)',
  'cm.ui.colPrinciple': 'Payment principle',
  'cm.ui.jurorCaption': 'Jurors',
  'cm.ui.committeeCaption': 'Steering Committee Members',
  'cm.ui.recruiterCaption': 'Recruiting Committee Members: performance incentive',
  'cm.ui.colRecruits': 'Recruits',
  'cm.ui.colPayBasis': 'Payment basis',
  'cm.ui.colPayTotal': 'Amount paid (cumulative)',
  'cm.ui.recruiterNote':
    'When recruits reach 30, the 1st through 30th are calculated at KRW 10,000 per person, and from the 31st onward the unit rate for that band is added. This is added on top of basic activity allowances, such as meeting attendance, and is calculated separately.',
  'cm.ui.fairnessEyebrow': 'Principles of fairness',
  'cm.ui.fairnessTitle': 'Exclusion, recusal and challenge',
  'cm.ui.fairnessLede':
    'Where a relationship could compromise the fairness of judging, the juror withdraws from judging that work.',
  'cm.ui.recusalTitle': 'When a juror is excluded from judging a work',
  'cm.ui.recusalNote':
    'If any of the above applies, or the juror judges that a fair review is difficult, they may recuse themselves with the permission of the Chair of the Jury. An entrant may file a written challenge before judging begins.',
  'cm.ui.dualTitle': 'When a juror also recruits',
  'cm.ui.dualBody':
    'If an entrant you recruited is included in that exhibition’s judging, you are either excluded from recruitment incentive payments or must be excluded from judging that entry.',
  'cm.ui.applyEyebrow': 'Three ways to fill it in',
  'cm.ui.applyTitle': 'Filling in the application',
  'cm.ui.applyLede':
    'The online application is accepted once you answer the step-by-step questions and press the send button at the end. To submit on paper, download the Hancom Docs (HWPX) or PDF form.',
  'cm.ui.formTitle': 'Online juror & committee appointment application',
  'cm.ui.formRecommended': 'Recommended',
  'cm.ui.formFrameTitle':
    'Korea Oriental Calligraphy Grand Exhibition juror & committee appointment application',
  'cm.ui.formFallback': 'If the form does not appear',
  'cm.ui.formOpenNew': 'Open in a new window',
  'cm.ui.contactEyebrow': 'Enquiries & consultation',
  'cm.ui.contactTitle': 'If you have any questions',
  'cm.ui.contactLede':
    'For questions about eligibility, concurrent posts or allowances, please contact the Secretariat directly.',
  'cm.download.1.type': 'Hancom Docs HWPX',
  'cm.download.1.title': 'Juror & committee application form (Hancom Docs)',
  'cm.download.1.note': 'Fill in with Hancom Docs on a PC',
  'cm.download.2.type': 'Adobe PDF',
  'cm.download.2.title': 'Juror & committee application form (PDF)',
  'cm.download.2.note': 'Download, print and fill in by hand',
  'cm.role.1.title': 'Jurors',
  'cm.role.1.duty':
    'Score entries on four items (stroke quality, structure, layout and harmony) and write a judging commentary for each division.',
  'cm.role.1.qual.1':
    'Invited Artists of the Society (including Advisory Committee members and Senior Advisors)',
  'cm.role.1.qual.2': 'Invited Artists of other calligraphy organisations',
  'cm.role.1.qual.3':
    'Persons recommended by a Senior Advisor or Advisory Committee member of the Society',
  'cm.role.1.src.1': 'Art. 3',
  'cm.role.1.src.2': 'Art. 6',
  'cm.role.2.title': 'Steering Committee Members',
  'cm.role.2.duty':
    'Attend the operating meetings of the Korea Oriental Calligraphy Grand Exhibition. One meeting is based on two hours.',
  'cm.role.2.qual.1':
    'Invited Artists of the Society (including Advisory Committee members and Senior Advisors)',
  'cm.role.2.qual.2': 'Invited Artists of other calligraphy organisations',
  'cm.role.2.qual.3':
    'Persons recommended by a Senior Advisor or Advisory Committee member of the Society',
  'cm.role.2.src.1': 'Art. 3',
  'cm.role.2.src.2': 'Art. 4-2',
  'cm.role.3.title': 'Recruiting Committee Members',
  'cm.role.3.duty':
    'Promote the Society’s exhibition and recruit entrants. We look first at understanding of the exhibition and enthusiasm for promotion.',
  'cm.role.3.qual.1':
    'Full Members of the Society with at least one year of activity who have actively taken part in the Society’s activities',
  'cm.role.3.qual.2':
    'Those with at least three years of promotion, marketing or planning experience in art or arts-related fields',
  'cm.role.3.qual.3':
    'Those recommended by at least one Invited Artist of the Society and recognised as clearly willing to contribute to the Society’s development',
  'cm.role.3.qual.4':
    'Artists with at least three entries in competitions or exhibitions organised by the Society',
  'cm.role.3.src.1': 'Art. 3-3',
  'cm.step.1.title': 'Submit application',
  'cm.step.1.body':
    'Send the online application, or fill in the Hancom Docs or PDF form and submit it to the Secretariat.',
  'cm.step.2.title': 'Recommendation of twice the number needed',
  'cm.step.2.body':
    'One month before the Grand Exhibition opens, the Chairperson sets the number based on the number of works to be judged and recommends twice that number.',
  'cm.step.3.title': 'Board of Directors resolution',
  'cm.step.3.body':
    'The Board of Directors resolves the appointment and presents a certificate of appointment.',
  'cm.step.4.title': 'Term',
  'cm.step.4.body':
    'The term runs from the appointment date to the close of the Korea Oriental Calligraphy Grand Exhibition in the current year. Re-examination of objections is handled until processing is complete.',
  'cm.src.step.1': 'Regulations on Operation and Review, Art. 4',
  'cm.src.step.2': 'Art. 8',
  'cm.jurorPay.1.1': 'Judging allowance (judging fee)',
  'cm.jurorPay.1.2': 'KRW 150,000 (per day / half day)',
  'cm.jurorPay.1.3': 'Paid according to the scale of judging and the time required',
  'cm.jurorPay.2.1': 'Manuscript fee (judging commentary)',
  'cm.jurorPay.2.2': 'KRW 100,000 (per item)',
  'cm.jurorPay.2.3': 'Paid separately when the judging commentary is written',
  'cm.jurorPay.3.1': 'Travel expenses (transport)',
  'cm.jurorPay.3.2': 'Actual-cost reimbursement (KTX, express bus, etc.)',
  'cm.jurorPay.3.3': 'Paid by actual-cost reimbursement',
  'cm.jurorPay.4.1': 'Meals (lunch / dinner)',
  'cm.jurorPay.4.2': 'KRW 20,000 (per meal)',
  'cm.jurorPay.4.3': 'Paid when lunch or dinner is included in the judging schedule',
  'cm.committeePay.1.1': 'Meeting attendance allowance',
  'cm.committeePay.1.2': 'KRW 100,000 (per meeting)',
  'cm.committeePay.1.3': 'Paid according to meeting time (based on two hours)',
  'cm.committeePay.2.1': 'Travel expenses (transport)',
  'cm.committeePay.2.2': 'Actual-cost reimbursement (as a rule)',
  'cm.committeePay.2.3': 'Follows the standard for jurors',
  'cm.committeePay.3.1': 'Meals (as needed)',
  'cm.committeePay.3.2': 'KRW 20,000 (per meal)',
  'cm.committeePay.3.3': 'Paid according to meeting time',
  'cm.recruiterPay.1.1': 'Tier 4 (advanced)',
  'cm.recruiterPay.1.2': '1–29 people',
  'cm.recruiterPay.1.3': 'KRW 5,000 per recruit',
  'cm.recruiterPay.1.4': 'Recruits × KRW 5,000',
  'cm.recruiterPay.2.1': 'Tier 3 (skilled)',
  'cm.recruiterPay.2.2': '30 people',
  'cm.recruiterPay.2.3': '1st–30th, KRW 10,000 per person',
  'cm.recruiterPay.2.4': 'KRW 300,000',
  'cm.recruiterPay.3.1': 'Tier 2 (excellent)',
  'cm.recruiterPay.3.2': '31–40 people',
  'cm.recruiterPay.3.3': '31st–40th, KRW 12,000 extra per person',
  'cm.recruiterPay.3.4': 'KRW 420,000 at 40 people',
  'cm.recruiterPay.4.1': 'Tier 1 (top)',
  'cm.recruiterPay.4.2': '41 people or more',
  'cm.recruiterPay.4.3': 'From the 41st, KRW 15,000 extra per person',
  'cm.recruiterPay.4.4': 'KRW 570,000 at 50 people',
  'cm.src.pay.1': 'Regulations on Operation and Review, Art. 4-2',
  'cm.recusal.1': 'The juror is the spouse, or a lineal ascendant or descendant, of the entrant',
  'cm.recusal.2': 'The juror is the entrant’s teacher, or the entrant is the juror’s student',
  'cm.recusal.3': 'Other clear grounds under which a fair judging cannot be expected',
  'cm.src.fairness.1': 'Regulations on Operation and Review, Art. 3-2',
  'cm.src.fairness.2': 'Art. 4-2 ⑤',
}

export default commissioning

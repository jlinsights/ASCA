import type { FaqTranslations } from './site-faq-locale'

/** 한국어 원문과 같은 ID·금액·비율·근거 순서를 유지한다. */
export const SITE_FAQ_EN: FaqTranslations = {
  'membership-join': {
    q: 'How do I join the association as a full member?',
    a: 'Check the grades and fees on the membership page, then submit a membership application to the office. Membership requires agreement with the association’s purpose and approval by the board.\n\nNew applicants should check the registration fee and annual dues for their age-based young or general grade. Recommended and invited status require a separate appointment process. A website account alone does not complete membership.',
    sources: ['Membership guide', 'Articles of Incorporation, Art. 5'],
  },
  benefits: {
    q: 'What are the benefits of full membership in the association?',
    a: '[All full members]\n- One free catalogue when you take part in an exhibition\n- Member rates for entry, mounting and catalogue fees\n- Annual dues waived when a full member signs a personal website contract and pays the annual maintenance fee\n\n[Recommended artists and above]\n- Opportunity to register as an invited-artist candidate\n- Priority for special exhibitions and international exchange exhibitions\n- Selective support for the initial cost of a personal website, if requirements are met\n\n[Invited artists and above]\n- Eligibility for officer nomination, and for steering committee and jury membership\n\n[Officers]\n- Priority for appointment to the steering committee and jury\n- Initial personal website cost and first-year maintenance waived\n- 5% discount on Invited Artists Exhibition entry fees\n\nBenefits by grade are summarized on the membership page.',
    sources: [
      'Regulations on Membership and Dues, Art. 12',
      'Regulations on Membership and Dues, Art. 10',
      'Membership · Member benefits',
    ],
  },
  dues: {
    q: 'Are there separate annual dues?',
    a: 'Annual dues and registration fees by membership grade:\n- Young artist (age 40 or under as of January 1): annual dues KRW 30,000 + joining fee KRW 10,000\n- General artist (age 41 or over): annual dues KRW 50,000 + joining fee KRW 20,000\n- Recommended artist: annual dues KRW 80,000 + promotion fee KRW 30,000\n- Invited artist: annual dues KRW 100,000 + promotion fee KRW 50,000\n- Officer: annual dues KRW 200,000 + development fund KRW 2,000,000 on taking office\n\nNon-members specially appointed as recommended or invited artists pay a special appointment registration fee (recommended artist KRW 50,000, invited artist KRW 100,000) and a review fee of KRW 50,000 instead of the joining and promotion fees.\n\nAnnual dues are due by January 31 each year. If unpaid for the current year, membership rights are restricted; after 2 consecutive years unpaid, membership is suspended; after 3 consecutive years, the member may be expelled by resolution of the board. Status restricted or suspended for unpaid dues is restored once the unpaid dues are paid in full.',
    sources: ['Regulations on Membership and Dues, Art. 2', 'Art. 3', 'Art. 5'],
  },
  'dues-payment': {
    q: 'Where can I pay dues and check my payment history?',
    a: 'Use the payment channel linked from the dues and support page and select the appropriate fee. The payment-history channel lets you check records after identity verification.\n\nIf a paid fee still appears unpaid, ask the office to check the payer’s name, date and amount before paying again. Website sign-in and dues payment are separate states.',
    sources: ['Dues and support', 'Regulations on Membership and Dues, Art. 11'],
  },
  'dues-unpaid': {
    q: 'What if I have unpaid dues or difficulty paying?',
    a: 'The current rules provide for restrictions for the current year’s unpaid dues, suspension after 2 consecutive unpaid years, and possible expulsion by board resolution after 3. First ask the office to confirm the years, amounts and payment or exemption records.\n\nFor special circumstances, the board may approve deferral or installments. A member already expelled must reapply for admission; payment alone does not readmit them.',
    sources: ['Regulations on Membership and Dues, Art. 5', 'Contact the office'],
  },
  'dues-exemption': {
    q: 'Are there annual-dues exemptions besides lifetime membership?',
    a: 'Full members with a personal website contract who pay that year’s maintenance fee are exempt from that year’s dues. See the website guide and rules for first-year exhibition benefits.\n\nMembers aged 70 or over with at least 10 years of membership and outstanding contributions may receive an exemption after board review. Age alone does not grant it automatically; confirm eligibility with the office.',
    sources: [
      'Regulations on Membership and Dues, Art. 10',
      'Regulations on Membership and Dues, Art. 13',
    ],
  },
  lifetime: {
    q: 'Lifetime members are exempt from annual dues. What are the requirements?',
    a: 'A lifetime member has paid the lifetime fee in a lump sum (or in installments) and is permanently exempt from annual dues.\n\n- Any full member at invited-artist grade or above may pay the lifetime fee (10 times the annual dues) and apply for lifetime membership. For invited artists it is KRW 1,000,000.\n- Officers who pay the development fund of KRW 2,000,000 in full on taking office automatically become lifetime members. The development fund can be paid in installments by CMS over up to 20 months.\n- A lifetime member who is appointed an officer pays only the development fund minus the lifetime fee already paid.',
    sources: ['Regulations on Membership and Dues, Art. 3', 'Art. 4'],
  },
  'dues-usage': {
    q: 'How are annual dues used?',
    a: "Annual dues fund the association's programs and operations set out in its articles of incorporation.\n\n1. Programs: discovering new artists through Korea–China–Japan joint exhibitions and national open calls, exchange exhibitions and academic presentations at home and abroad, developing and fostering Korean scripts, and research on overseas calligraphy literature\n2. Operations: running the secretariat, events and exhibitions\n\nThe budget and settlement of accounts are approved by the general assembly, and the auditor audits the accounts at least twice a year.",
    sources: ['Articles of Incorporation, Art. 4', 'Art. 22', 'Art. 36'],
  },
  'membership-withdrawal': {
    q: 'How do I withdraw from association membership?',
    a: 'The articles allow withdrawal by submitting a withdrawal notice to the chairman. Ask the office how to submit it and verify your identity.\n\nAssociation withdrawal, website-account handling and ending an ongoing exhibition or website contract are separate matters. Specify any contracts or public materials you also want reviewed.',
    sources: ['Articles of Incorporation, Art. 8', 'Contact the office'],
  },
  'contest-apply': {
    q: 'Where can I find contest dates and entry instructions?',
    a: 'Open the guidelines for the edition you want to enter. Check the deadline, categories, sizes, fees, documents and delivery instructions together.\n\nUse that edition’s online application if available. If physical works or paper documents are required, follow the stated address and arrival deadline. Do not assume another edition’s dates or payment details apply.',
    sources: ['Contest guide', 'Entry application guide'],
  },
  'contest-eligibility': {
    q: 'Can non-members and first-time entrants take part?',
    a: 'Being a first-time entrant or a non-member does not automatically exclude you from every contest. Check the edition’s actual nationality, residence, age and prior-publication requirements.\n\nOpen-call and invited-artist sections may have different eligibility and fees. Taking part does not itself grant recommended or invited artist status.',
    sources: ['Contest guide'],
  },
  'entry-fees': {
    q: 'How many works can I enter in the Korea Oriental Calligraphy Grand Exhibition, and what are the fees?',
    a: 'General contest entry fees are separate from mounting:\n- Young artist: KRW 50,000 for the first work; KRW 40,000 per additional work from the 2nd to 9th\n- General artist: KRW 60,000; KRW 50,000 for each additional work\n- Recommended artist: KRW 100,000; KRW 90,000 for each additional work\n- Invited artist: KRW 200,000; KRW 190,000 for each additional work\n\nNon-member fees and fees from the 10th work are set by the relevant call. Check that edition’s guidelines for the actual entry limit and eligibility. Solo and booth exhibitions use a separate fee schedule.',
    sources: ['Regulations on Membership and Dues, Art. 6', 'Contest guide'],
  },
  'contest-sizes': {
    q: 'Which categories and artwork sizes are accepted?',
    a: 'The standard categories cover Korean and Chinese calligraphy, contemporary calligraphy, seal or wood carving, and painting such as literati painting. Standard paper sizes are 70×200cm, 70×136cm and 35×136cm.\n\nCheck the relevant call for category-specific limits and mounting or size requirements for works in other materials. Before shipping, match the title, artist, category and dimensions to your application.',
    sources: ['Regulations on Operation and Judging, Art. 5', 'Contest guide'],
  },
  awards: {
    q: 'What are the awards and prize money of the Korea Oriental Calligraphy Grand Exhibition?',
    a: "[Main prizes]\n- Grand Prize: 1 winner, certificate and KRW 2,000,000\n- Top Excellence Prize: 1 winner, certificate and KRW 1,000,000\n- Excellence Prize: 2 winners, certificate and KRW 300,000\n\n[Special prizes]\n- Five-Script Prize: 3 winners, certificate and KRW 200,000\n- Three-Script Prize: 4 winners, certificate and KRW 150,000\n\n[Other honors] Special Selection 30, Selected 50 (certificate)\n\nThe number of awards may be adjusted by resolution of the board according to the number and level of entries, and special prizes such as a sponsor's prize or chairman's prize may be created by resolution of the board depending on finances or special sponsorship. Taxes on prize money are borne by the winner.",
    sources: ['Regulations on Operation and Judging, Art. 7'],
  },
  'artist-selection': {
    q: 'What are the criteria for selecting recommended and invited artists?',
    a: 'Points for awards at the Korea Oriental Calligraphy Grand Exhibition:\n- Selected 1 / Special Selection 3 / Three-Script Prize 5 / Five-Script Prize 7\n- Excellence Prize 7 / Top Excellence Prize 8 / Grand Prize 9\nOnly the single highest score in a given year counts.\n\nRecommended artists are chosen from those with 10 or more points in total, and invited artists from those with 15 or more. Recommended artists need at least 3 years as a full member, and invited artists at least 5 years as a recommended artist.\n\nPoints alone do not bring promotion. Candidates must also have entered consecutively within the last 3 years, passed a portfolio review of representative works, taken part in at least 3 association activities, and have no disciplinary action in the last 5 years. With the approval of at least two-thirds of the qualification review committee, the chairman makes the final appointment.\n\nThose without award points but with contributions or experience may apply for special appointment. Eligibility and costs are explained under "Can I become a recommended or invited artist without being a full member?"',
    sources: [
      'Regulations on Appointing Recommended and Invited Artists, Art. 2',
      'Art. 3',
      'Art. 4',
      'Art. 8',
      'Art. 9',
    ],
  },
  portfolio: {
    q: 'What should I prepare for an artist appointment review?',
    a: 'Prepare the appointment application and 3 representative works made within the last 3 years. Ordinary appointment also requires records supporting the relevant award points, activity history, entries and association contributions.\n\nSpecial appointment uses different eligibility rules, so check your application type first. Confirm formats and dates in the guide, and ask the office about unclear records before submitting.',
    sources: [
      'Artist Appointment Regulations, Art. 3',
      'Artist Appointment Regulations, Art. 8',
      'Appointment applications',
    ],
  },
  'special-appointment': {
    q: 'Can I become a recommended or invited artist without being a full member?',
    a: 'Yes, you can apply for special appointment if any of the following applies:\n- You have made a special contribution to the development of calligraphy culture\n- You have taught calligraphy in Korea or abroad for 20 years or more\n- You are an invited artist of another calligraphy organization registered with the Ministry of Culture, Sports and Tourism\n\nYou apply yourself, stating the status (recommended or invited) and the track (traditional or contemporary) on the application form. At the regular review, the qualification review committee examines your documents and works. If you pass, the board of directors resolves with a two-thirds majority and the chairman makes the appointment. The board may also resolve on a lower status than the one you applied for.\n\nCosts of special appointment for non-members (review fee + registration fee + first-year dues):\n- Recommended artist: KRW 50,000 + KRW 50,000 + KRW 80,000 = KRW 180,000\n- Invited artist: KRW 50,000 + KRW 100,000 + KRW 100,000 = KRW 250,000\nThe review fee is paid when you apply and is not refunded. The registration fee and first-year dues are paid after the appointment is resolved, at the resolved status; you are appointed, and become a full member, on the day everything is paid. The application also serves as the membership application.\n\nIf you are already a full member, you pay only the promotion registration fee from your current grade to the resolved grade (for example, general artist → invited artist: KRW 80,000). Members whose rights are restricted or suspended because of unpaid dues must first pay in full to restore their status, then apply.',
    sources: [
      'Regulations on Appointing Recommended and Invited Artists, Art. 11',
      'Regulations on Membership and Dues, Art. 3',
      'Special appointment guide',
    ],
  },
  committee: {
    q: 'What are the qualifications and allowances for jury and steering committee members?',
    a: 'Qualifications for the steering committee and jury:\n① Invited artists of the association (including advisers and counselors)\n② Invited artists of other calligraphy organizations\n③ People recommended by an adviser or counselor of the association\n\nQualifications for recruitment committee members (one or more):\n1. A full member who has taken an active part in association activities for at least 1 year\n2. At least 3 years of experience in promotion, marketing or planning in fine art or the arts\n3. Recommended by at least one invited artist of the association\n4. At least 3 entries in open calls or exhibitions organized by the association\n\nPay for appointed positions is divided into allowances, travel expenses and performance incentives. Jury members receive a judging allowance of KRW 150,000 (full or half day), a fee of KRW 100,000 for the judging review, actual travel expenses and KRW 20,000 for meals. Steering committee members receive KRW 100,000 per meeting attended, actual travel expenses and KRW 20,000 for meals. These are proposed reference rates under the rules; confirm actual amounts and eligible activities in the appointment notice.\n\nTo apply, submit the "Committee appointment application" to the secretariat.',
    sources: ['Regulations on Operation and Judging, Art. 3', 'Art. 3-3', 'Art. 4-2'],
  },
  objections: {
    q: 'How do I raise an objection or report an entry error?',
    a: 'Submit your name, contact details, entry number or category, the issue, specific reasons and evidence, and the action requested through the office email or designated written channel.\n\nThe current rules generally allow 7 days from the official result announcement. Check any separate deadline in the call. Distinguish a simple disagreement with a score from a factual issue such as an omitted score or incorrect information.',
    sources: ['Objections Procedure, Art. 3', 'Objections Procedure, Art. 4', 'Contact the office'],
  },
  'solo-booth': {
    q: 'How many works do I need for a solo or independent booth exhibition?',
    a: 'Plan on at least 10 works for a solo or independent booth exhibition. This is different from entering 1–9 works in an ordinary contest.\n\nConfirm the terms for your membership, number and sizes of works, and shared or independent space. Send your exhibition plans and work list to the office and confirm space, entry, mounting and catalogue costs before contracting.',
    sources: ['Regulations on Membership and Dues, Art. 7', 'Contact the office'],
  },
  'exhibition-plan': {
    q: 'Can the association help plan my exhibition or arrange a venue?',
    a: 'The association can assist with venue booking, administration, planning, staging and promotion. Share your preferred dates, venue, work count, dimensions and budget.\n\nConfirm availability, responsibilities, artist-paid costs and payment dates before signing. An inquiry or quotation request does not itself secure a venue.',
    sources: [
      'Exhibition Regulations, Art. 3',
      'Exhibition Regulations, Art. 4',
      'Contact the office',
    ],
  },
  mounting: {
    q: 'Is mounting charged separately, and what about already mounted works?',
    a: 'Mounting is separate from the entry fee. The current rules specify association-standard options and hand backing for works selected or higher.\n\nStandard prices (full-member prices) are KRW 80,000 (KRW 60,000) for a half sheet, KRW 100,000 (KRW 80,000) for a full sheet and KRW 120,000 (KRW 100,000) for gukjeonji. For already mounted or specially shaped works, confirm delivery, installation and costs with the office before shipping.',
    sources: ['Regulations on Membership and Dues, Art. 8', 'Contact the office'],
  },
  catalogue: {
    q: 'Can I receive an exhibition catalogue or buy extra copies?',
    a: 'Under the current rules, full members participating in an exhibition receive one joint catalogue free. Extra copies, or purchases by those outside the free-copy entitlement, cost KRW 20,000 for members and KRW 30,000 for non-members.\n\nCheck distribution dates, collection options and availability with the exhibition guide or office. Buying a joint catalogue is separate from commissioning a personal catalogue.',
    sources: ['Regulations on Membership and Dues, Art. 9'],
  },
  'personal-catalogue': {
    q: 'What should I prepare for a personal or online catalogue?',
    a: 'Prepare the exhibition name, deadline, artwork images and details, biography, and the desired print size, page count and quantity. For an online catalogue, also specify where it will appear, the public-access scope and any website contract.\n\nA joint exhibition catalogue and a personal catalogue have different scopes. Confirm responsibilities and costs for editing, design, printing, delivery and online publication in the quotation and contract.',
    sources: [
      'Exhibition Regulations, Art. 3',
      'Exhibition Regulations, Art. 4',
      'Contact the office',
    ],
  },
  'exhibition-sales': {
    q: 'How are exhibition sales fees and payments handled?',
    a: 'The artist sets the price. The current sales-agency fee is 30% of the final sale price, with the remaining 70% subject to applicable tax handling.\n\nPayment, purchase confirmation and exhibition completion affect settlement. Confirm the actual payment date and deductions in the contract or settlement notice. Public disclosure of contact or transaction details should be considered separately from displaying the artwork.',
    sources: ['Exhibition Regulations, Art. 7', 'Contact the office'],
  },
  'exhibition-proof': {
    q: 'Can I get a certificate of exhibition participation?',
    a: 'Artists who joined an exhibition organized or managed by the association can request a participation certificate. Tell the office the exhibition, year, artist name, recipient organization and required details.\n\nThe current rules provide free issuance for members; a separate fee may apply to non-members. Issuance does not guarantee the recipient organization’s recognition or selection for a grant.',
    sources: ['Exhibition Regulations, Art. 8', 'Contact the office'],
  },
  'artist-website': {
    q: 'Do you help artists build and maintain websites?',
    a: "Yes, we build and maintain personal websites for artists.\n\n[Personal website costs]\n- Initial build: KRW 700,000 (full members KRW 600,000)\n- Annual maintenance: KRW 300,000 (full members KRW 200,000)\n\nFull members who sign a website contract and pay the annual maintenance fee are exempt from that year's annual dues.\n\n[Benefits by number of works exhibited]\n- 40 or more works: build cost and first-year maintenance fully waived, and that year's annual dues waived. From the second year, paying only the maintenance fee waives the annual dues\n- 30–39 works: initial build cost waived, and that year's annual dues waived\n- 20–29 works: 50% off the initial build cost\n\nWebsites for two-person, joint and group exhibitions have separate rates by number of participants; the benefits by number of works apply only to solo exhibition websites.",
    sources: ['Regulations on Membership and Dues, Art. 10', 'Art. 10-2'],
  },
  'website-group': {
    q: 'Can two-person or group exhibitions have a shared website?',
    a: 'Two or more exhibitors can request a shared website. Build and annual maintenance fees depend on the number of participants. Member rates require every participant to be a full member; check standard rates if a non-member or suspended member is included.\n\nSolo-exhibition quantity benefits do not also apply to the group website. Prepare the artist list, site structure, languages and any additional features before requesting a quotation.',
    sources: ['Regulations on Membership and Dues, Art. 10-2', 'Contact the office'],
  },
  'english-name': {
    q: 'Why do you ask for my name in English?',
    a: 'An English rendering of your name or pen name helps identify your artist page and introduce you in other languages. Page addresses follow https://orientalcalligraphy.org/artists/your-identifier.\n\nSend your preferred spelling to the office. Duplicate names or changes to an existing address need to be checked together. Providing an English name does not itself complete full membership or approval to link an artist page.',
    sources: ['Artists'],
  },
  'artist-link': {
    q: 'How do I link an existing artist page to my account?',
    a: 'After signing in, use Link artist page in My artist space. Find your page by name, Chinese-character name or pen name and submit a request. The office verifies your identity before granting management access.\n\nIf no page is found, use the unlisted-artist instructions or contact the office. For duplicate names or a page linked to another account, provide the existing address rather than creating a duplicate.',
    sources: ['My artist space', 'Contact the office'],
  },
  'artist-profile': {
    q: 'Can I edit my artist biography and English name?',
    a: 'Sign in with the account linked to your artist page and check the editable biography and English-language fields in the profile editor. Official artist names and grades managed by the association are separate from those editable fields.\n\nIf editing is restricted or changes are not visible, check the page link and visibility settings, then send the office the page address, field and error screen.',
    sources: ['Edit artist profile', 'My artist space'],
  },
  'artwork-upload': {
    q: 'What do I need to register an artwork image?',
    a: 'Sign in with an account approved to manage your artist page, then use the artwork submission screen. Prepare an image and the requested title, year, dimensions and materials. Check accepted formats and file limits on that screen.\n\nOnly use images you are authorized to submit and check that photos do not reveal contact details or addresses. Registering an online artwork does not enter it in a contest.',
    sources: ['Submit artwork', 'My artist space'],
  },
  classes: {
    q: 'Do you run calligraphy classes?',
    a: 'The classes page introduces courses, instructors and venues at Munwon Hanmun Calligraphy Academy and Seoul Arts Center’s Calligraphy & Painting Academy. Beginners can ask about a course suited to their experience and interests.\n\nStart dates, availability, timetables, tuition and enrollment methods vary by institution and term. Check the current course information before applying.',
    sources: ['Classes'],
  },
  'class-discount': {
    q: 'Can academy students receive an exhibition entry discount?',
    a: 'The classes-page partnership applies to Seoul Arts Center Calligraphy & Painting Academy students planning to enter an association contest, invited-artist or special exhibition. It discounts the entry fee by an amount equal to 5% of tuition, with a further 5% for full members.\n\nShow proof of enrollment and confirm eligibility and the amount with the office before entering. This is not a blanket tuition discount at every institution.',
    sources: ['Classes', 'Contact the office'],
  },
  exchanges: {
    q: 'Where can I find international exchange and special exhibition opportunities?',
    a: 'Check exhibitions and notices for schedules and calls. Eligibility, capacity, selection, costs and transport terms vary by event.\n\nPriority for full members at recommended-artist grade or above operates alongside each event’s selection criteria. Membership grade does not automatically secure a place in every exhibition.',
    sources: ['Exhibitions', 'Notices', 'Regulations on Membership and Dues, Art. 12'],
  },
  login: {
    q: 'Do existing members need to sign up again to log in?',
    a: 'Existing association members also need an email account on the new website. Confirm your email, then sign in. If you already have a new-site account, use it rather than registering again.\n\nA website account and full membership in the association are separate. Creating an account neither pays dues nor grants artist status. Existing artists can request a page link from My artist space after signing in.',
    sources: ['Sign up', 'My artist space'],
  },
  'email-verification': {
    q: 'My confirmation email is missing or its link has expired. What should I do?',
    a: 'Check the address you entered and your spam or promotions folder. Resend the confirmation from the sign-up confirmation or sign-in screen and use the newest email link. Wait for any resend countdown to finish.\n\nIf it still fails, send the office your account email, time and error message. Do not include your password or the full verification link.',
    sources: ['Sign in', 'Contact the office'],
  },
  'password-reset': {
    q: 'I forgot my password, or my old password no longer works.',
    a: 'Enter your registered email on the password-reset page and follow the email link to set a new password. Existing association members who have not yet created a new-site account must register first.\n\nIf you requested several emails, use the latest and follow the displayed password requirements. The office cannot look up your old password and will not ask you to send it by email.',
    sources: ['Reset password'],
  },
  inquiry: {
    q: 'What information should I include when contacting the office?',
    a: 'Include the topic, artist name, reply details and exhibition or application reference. For payments, give the date, amount and payer name. For site problems, include the page address, time, device, browser and error text.\n\nUse the contact page’s inquiry channel, email or phone. Do not post account statements, addresses or identity documents publicly, or send passwords or verification codes.',
    sources: ['Contact the office'],
  },
  'support-method': {
    q: 'Can I support the association without being a member?',
    a: 'If you would like to support the association, see the dues and support page for payment channels and contact details. Discuss the purpose, use and documentation of support for a particular exhibition or project with the office first.\n\nDonations are separate from annual dues, membership registration and exhibition fees. Support alone does not grant membership, artist appointment or a place in an exhibition.',
    sources: ['Dues and support', 'Contact the office'],
  },
  'donation-receipt': {
    q: 'Can I get a receipt for a donation?',
    a: 'For proof of payment, ask the office for a donation confirmation and provide the donor’s name, payment date and amount. This confirms payment and is distinct from a receipt for tax relief.\n\nCheck with the office before donating if you need a tax-purpose receipt. Making a donation does not by itself guarantee a tax credit or deduction.',
    sources: ['Dues and support', 'Contact the office'],
  },
}

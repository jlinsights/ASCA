import type { FaqTranslations } from './site-faq-locale'

/**
 * 자주 묻는 질문 — 영어. 원문은 site-faq.ts(한국어, 규정 근거)이고 여기는 그 번역이다.
 * 금액은 원문과 같아야 한다(테스트가 원 단위로 비교). 근거 링크 이름은 원문 sources 와 같은 순서.
 */
export const SITE_FAQ_EN: FaqTranslations = {
  'artist-selection': {
    q: 'What are the criteria for selecting recommended and invited artists?',
    a: `Points for awards at the Korea Oriental Calligraphy Grand Exhibition:
- Selected 1 / Special Selection 3 / Three-Script Prize 5 / Five-Script Prize 7
- Excellence Prize 7 / Top Excellence Prize 8 / Grand Prize 9
Only the single highest score in a given year counts.

Recommended artists are chosen from those with 10 or more points in total, and invited artists from those with 15 or more. Recommended artists need at least 3 years as a full member, and invited artists at least 5 years as a recommended artist.

Points alone do not bring promotion. Candidates must also have entered consecutively within the last 3 years, passed a portfolio review of representative works, taken part in at least 3 association activities, and have no disciplinary action in the last 5 years. With the approval of at least two-thirds of the qualification review committee, the chairman makes the final appointment.

Those without award points but with contributions or experience may apply for special appointment. Eligibility and costs are explained under "Can I become a recommended or invited artist without being a full member?"`,
    sources: [
      'Regulations on Appointing Recommended and Invited Artists, Art. 2',
      'Art. 3',
      'Art. 4',
      'Art. 8',
      'Art. 9',
    ],
  },
  'special-appointment': {
    q: 'Can I become a recommended or invited artist without being a full member?',
    a: `Yes, you can apply for special appointment if any of the following applies:
- You have made a special contribution to the development of calligraphy culture
- You have taught calligraphy in Korea or abroad for 20 years or more
- You are an invited artist of another calligraphy organization registered with the Ministry of Culture, Sports and Tourism

You apply yourself, stating the status (recommended or invited) and the track (traditional or contemporary) on the application form. At the regular review, the qualification review committee examines your documents and works. If you pass, the board of directors resolves with a two-thirds majority and the chairman makes the appointment. The board may also resolve on a lower status than the one you applied for.

Costs of special appointment for non-members (review fee + registration fee + first-year dues):
- Recommended artist: KRW 50,000 + KRW 50,000 + KRW 80,000 = KRW 180,000
- Invited artist: KRW 50,000 + KRW 100,000 + KRW 100,000 = KRW 250,000
The review fee is paid when you apply and is not refunded. The registration fee and first-year dues are paid after the appointment is resolved, at the resolved status; you are appointed, and become a full member, on the day everything is paid. The application also serves as the membership application.

If you are already a full member, you pay only the promotion registration fee from your current grade to the resolved grade (for example, general artist → invited artist: KRW 80,000). Members whose rights are restricted or suspended because of unpaid dues must first pay in full to restore their status, then apply.`,
    sources: [
      'Regulations on Appointing Recommended and Invited Artists, Art. 11',
      'Regulations on Membership and Dues, Art. 3',
      'Special appointment guide',
    ],
  },
  'dues-usage': {
    q: 'How are annual dues used?',
    a: `Annual dues fund the association's programs and operations set out in its articles of incorporation.

1. Programs: discovering new artists through Korea–China–Japan joint exhibitions and national open calls, exchange exhibitions and academic presentations at home and abroad, developing and fostering Korean scripts, and research on overseas calligraphy literature
2. Operations: running the secretariat, events and exhibitions

The budget and settlement of accounts are approved by the general assembly, and the auditor audits the accounts at least twice a year.`,
    sources: ['Articles of Incorporation, Art. 4', 'Art. 22', 'Art. 36'],
  },
  dues: {
    q: 'Are there separate annual dues?',
    a: `Annual dues and registration fees by membership grade:
- Young artist (age 40 or under as of January 1): annual dues KRW 30,000 + joining fee KRW 10,000
- General artist (age 41 or over): annual dues KRW 50,000 + joining fee KRW 20,000
- Recommended artist: annual dues KRW 80,000 + promotion fee KRW 30,000
- Invited artist: annual dues KRW 100,000 + promotion fee KRW 50,000
- Officer: annual dues KRW 200,000 + development fund KRW 2,000,000 on taking office

Non-members specially appointed as recommended or invited artists pay a special appointment registration fee (recommended artist KRW 50,000, invited artist KRW 100,000) and a review fee of KRW 50,000 instead of the joining and promotion fees.

Annual dues are due by January 31 each year. If unpaid for the current year, membership rights are restricted; after 2 consecutive years unpaid, membership is suspended; after 3 consecutive years, the member may be expelled by resolution of the board. Restricted or suspended status is restored once the unpaid dues are paid in full.`,
    sources: ['Regulations on Membership and Dues, Art. 2', 'Art. 3', 'Art. 5'],
  },
  lifetime: {
    q: 'Lifetime members are exempt from annual dues. What are the requirements?',
    a: `A lifetime member has paid the lifetime fee in a lump sum (or in installments) and is permanently exempt from annual dues.

- Any full member at invited-artist grade or above may pay the lifetime fee (10 times the annual dues) and apply for lifetime membership. For invited artists it is KRW 1,000,000.
- Officers who pay the development fund of KRW 2,000,000 in full on taking office automatically become lifetime members. The development fund can be paid in installments by CMS over up to 20 months.
- A lifetime member who is appointed an officer pays only the development fund minus the lifetime fee already paid.`,
    sources: ['Regulations on Membership and Dues, Art. 3', 'Art. 4'],
  },
  benefits: {
    q: 'What are the benefits of full membership in the association?',
    a: `[All full members]
- One free catalogue when you take part in an exhibition
- Member rates for entry, mounting and catalogue fees
- Annual dues waived if you build a personal artist website

[Recommended artists and above]
- Opportunity to register as an invited-artist candidate
- Priority for special exhibitions and international exchange exhibitions
- Selective support for the initial cost of a personal website, if requirements are met

[Invited artists and above]
- Eligibility for officer nomination, and for steering committee and jury membership

[Officers]
- Priority for appointment to the steering committee and jury
- Initial personal website cost and first-year maintenance waived
- 5% discount on Invited Artists Exhibition entry fees

Benefits by grade are summarized on the membership page.`,
    sources: ['Regulations on Membership and Dues, Art. 12', 'Membership · Member benefits'],
  },
  'entry-fees': {
    q: 'How many works can I enter in the Korea Oriental Calligraphy Grand Exhibition, and what are the fees?',
    a: `Entry fees (mounting fee separate):
- Young artist: KRW 50,000 for 1 work (KRW 40,000 for the 2nd–9th)
- General artist: KRW 60,000 for 1 work (KRW 50,000 for the 2nd–9th)
- Recommended artist: KRW 100,000 for 1 work (KRW 90,000 for the 2nd–9th)
- Invited artist: KRW 200,000 for 1 work (KRW 190,000 for the 2nd–9th)
Fees for non-members and for the 10th work onward are set in the guidelines of each open call.

Solo and calligraphy-group booth exhibitions (10 or more works), standard fee per work (full-member rate):
- 10–19 works: KRW 180,000 (KRW 160,000)
- 20–29 works: KRW 160,000 (KRW 140,000)
- 30–39 works: KRW 140,000 (KRW 120,000)
- 40 or more works: KRW 120,000 (KRW 100,000)

Mounting fee (Selected or higher, hand-backed): half sheet KRW 80,000 (members KRW 60,000), full sheet KRW 100,000 (members KRW 80,000), gukjeonji KRW 120,000 (members KRW 100,000)`,
    sources: ['Regulations on Membership and Dues, Art. 6', 'Art. 7', 'Art. 8'],
  },
  awards: {
    q: 'What are the awards and prize money of the Korea Oriental Calligraphy Grand Exhibition?',
    a: `[Main prizes]
- Grand Prize: 1 winner, certificate and KRW 2,000,000
- Top Excellence Prize: 1 winner, certificate and KRW 1,000,000
- Excellence Prize: 2 winners, certificate and KRW 300,000

[Special prizes]
- Five-Script Prize: 3 winners, certificate and KRW 200,000
- Three-Script Prize: 4 winners, certificate and KRW 150,000

[Other honors] Special Selection 30, Selected 50 (certificate)

The number of awards may be adjusted by resolution of the board according to the number and level of entries, and special prizes such as a sponsor's prize or chairman's prize may be created by resolution of the board depending on finances or special sponsorship. Taxes on prize money are borne by the winner.`,
    sources: ['Regulations on Operation and Judging, Art. 7'],
  },
  classes: {
    q: 'Do you run calligraphy classes?',
    a: `We connect you only to calligraphy classes at institutions officially approved by the association's standing directors.

- Munwon Hanmun Calligraphy Academy: with the support of Daehan Geomjeonghoe of the Korea Hanja Education Research Association, the association runs calligraphy and East Asian painting classes on commission. Every Saturday 09:30–12:30, a 16-week term, tuition KRW 300,000.
- Seoul Arts Center Calligraphy & Painting Academy: students who plan to enter an association open call, invited artists exhibition or special exhibition receive a discount on the entry fee equal to 5% of tuition, and full members of the association receive a further 5%. Apply by showing your student card to the association secretariat.

See the classes page for courses, timetables and tuition.`,
    sources: ['Classes'],
  },
  'english-name': {
    q: 'Why do you ask for my name in English?',
    a: `We make an artist page introducing the works and career of every full member, and your English name becomes the address of that page.

Address format: https://www.orientalcalligraphy.org/artists/your-english-name
The old address (/calligrapher/your-english-name) still leads to the new one.

Tell us the name or pen name you would like, in English. After confirming your dues payment and full membership, we will create your artist page.`,
    sources: ['Artists'],
  },
  login: {
    q: 'Do existing members need to sign up again to log in?',
    a: `Yes. On the new website, existing members also need to create an account with their email once. After signing up, click the link in the confirmation email to log in.

If you are registered as an artist, after logging in go to "Link artist page" on the "My artist space" screen, find your artist page and request the link. Once the secretariat confirms your identity and approves, you can manage your artist information and works with this account.

Most content, including artists, works and exhibitions, can be viewed without logging in.`,
    sources: ['Sign up', 'My artist space'],
  },
  committee: {
    q: 'What are the qualifications and allowances for jury and steering committee members?',
    a: `Qualifications for the steering committee and jury:
① Invited artists of the association (including advisers and counselors)
② Invited artists of other calligraphy organizations
③ People recommended by an adviser or counselor of the association

Qualifications for recruitment committee members (one or more):
1. A full member who has taken an active part in association activities for at least 1 year
2. At least 3 years of experience in promotion, marketing or planning in fine art or the arts
3. Recommended by at least one invited artist of the association
4. At least 3 entries in open calls or exhibitions organized by the association

Pay for appointed positions is divided into allowances, travel expenses and performance incentives. Jury members receive a judging allowance of KRW 150,000 (full or half day), a fee of KRW 100,000 for the judging review, actual travel expenses and KRW 20,000 for meals. Steering committee members receive KRW 100,000 per meeting attended, actual travel expenses and KRW 20,000 for meals. To apply, submit the "Committee appointment application" to the secretariat.`,
    sources: ['Regulations on Operation and Judging, Art. 3', 'Art. 3-3', 'Art. 4-2'],
  },
  'donation-receipt': {
    q: 'Can I get a receipt for a donation?',
    a: `The association is not currently a tax-qualified organization, so it cannot issue donation receipts for tax purposes. If you need proof, we can issue a confirmation of donation (no tax benefit, for proof only).

We are preparing the steps to become a professional arts corporation under the Culture and Arts Promotion Act and then a public-interest corporation.`,
  },
  'artist-website': {
    q: 'Do you help artists build and maintain websites?',
    a: `Yes, we build and maintain personal websites for artists.

[Personal website costs]
- Initial build: KRW 700,000 (full members KRW 600,000)
- Annual maintenance: KRW 300,000 (full members KRW 200,000)

Full members who sign a website contract and pay the annual maintenance fee are exempt from that year's annual dues.

[Benefits by number of works exhibited]
- 40 or more works: build cost and first-year maintenance fully waived, and that year's annual dues waived. From the second year, paying only the maintenance fee waives the annual dues
- 30 or more works: initial build cost waived, and that year's annual dues waived
- 20 or more works: 50% off the initial build cost

Websites for two-person, joint and group exhibitions have separate rates by number of participants; the benefits by number of works apply only to solo exhibition websites.`,
    sources: ['Regulations on Membership and Dues, Art. 10', 'Art. 10-2'],
  },
}

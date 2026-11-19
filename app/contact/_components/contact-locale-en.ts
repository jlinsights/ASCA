import type { ContactCopy } from './contact-locale-types'

export const en: ContactCopy = {
  hero: {
    title: 'Contact',
    lede: 'How can we help? Pick a topic and we will take you straight to the answer. For a direct question, live chat is the fastest.',
    liveChat: 'Live chat',
    facts: [
      ['Phone', 'Weekdays 10:00–17:00 KST'],
      ['Objections', 'Within 7 days of results'],
      ['Final reply', 'Within 14 business days'],
    ],
  },
  newWindow: '(opens in a new window)',
  tocLabel: 'On this page',
  toc: {
    inquiry: 'Write an inquiry',
    topics: 'By topic',
    channels: 'Ways to reach us',
    objection: 'Objections',
    address: 'Address',
    events: 'Events',
    faq: 'FAQ',
  },
  topics: {
    eyebrow: 'By topic',
    title: 'How can we help?',
    lede: 'Common questions are answered on the pages below, together with the original regulations.',
    items: [
      {
        title: 'Contest entries',
        body: 'Entry forms, categories and work sizes, fees, judging and awards',
        cta: 'Entry form',
      },
      {
        title: 'Membership',
        body: 'Membership levels, eligibility and full-member benefits',
        cta: 'Membership',
      },
      {
        title: 'Paying dues',
        body: 'Annual, registration and development fees: how and when to pay',
        cta: 'Dues & support',
      },
      {
        title: 'Recommended & invited artists',
        body: 'Promotion requirements and applications',
        cta: 'Apply for promotion',
      },
      {
        title: 'Jury & committee',
        body: 'Eligibility, allowances and the appointment application',
        cta: 'Apply to serve',
      },
      { title: 'Calligraphy classes', body: 'Partner schools, courses and fees', cta: 'Classes' },
      { title: 'Downloadable forms', body: 'Applications and templates', cta: 'Forms' },
      {
        title: 'Objecting to a result',
        body: 'In writing, within 7 days of the contest or exhibition results',
        cta: 'Objection procedure',
      },
    ],
    note: 'Please send collaboration and partnership proposals by email. The society works with creators across fields, including brands and personal projects, that carry the tradition and spirit of East Asian art into contemporary art.',
  },
  channels: {
    eyebrow: 'Ways to reach us',
    title: 'Where should you get in touch?',
    lede: 'Each channel suits different needs. Please send documents and formal inquiries by email so there is a record.',
    fastest: 'Fastest',
    items: [
      {
        title: 'KakaoTalk live chat',
        value: 'ASCA KakaoTalk channel · every day',
        bestFor: 'The fastest. Most questions are answered right here.',
      },
      {
        title: 'Book a consultation',
        value: 'Mon–Fri 10:00–17:00 KST',
        bestFor: 'Longer conversations, such as entries or promotion',
      },
      { title: 'Phone', value: null, bestFor: 'Mon–Fri 10:00–17:00 KST' },
      { title: 'Email', value: null, bestFor: 'Documents, formal inquiries and objections' },
      { title: 'Fax', value: null, bestFor: 'Sending paper documents' },
    ],
  },
  objection: {
    eyebrow: 'Objecting to contest or exhibition results',
    title: 'Objection procedure',
    lede: 'This applies to every contest and exhibition the society hosts, organizes or runs on commission. Objections are accepted within 7 days of the official results announcement, unless a contest guideline sets a different deadline.',
    fieldsHead: 'Four things your written objection must include',
    fields: [
      {
        term: 'Personal details',
        detail: 'Name, contact details, entry number (or entry category)',
      },
      { term: 'Subject', detail: 'The specific item or procedure you object to' },
      {
        term: 'Reasons and evidence',
        detail: 'Specific reasons based on objective facts (attaching evidence is recommended)',
      },
      { term: 'Request', detail: 'What you are asking for: correction, fact-check, review, etc.' },
    ],
    mailCta: 'Write an email from the template',
    writtenNote: (email, phone) =>
      `Objections must be made in writing (email) to ${email}. If you raise one by phone (${phone}), you still need to submit the four items above in writing.`,
    deadlineCaption: 'Response times',
    deadlineColumns: ['Step', 'Deadline', 'What happens'],
    deadlines: [
      ['Receipt confirmed', 'Within 24 business hours', 'Confirmation of receipt sent'],
      ['First reply', 'Within 3 business days of receipt', 'Progress update on the review'],
      ['Final reply', 'Within 14 business days of receipt', 'Formal notice of the final decision'],
    ],
    extensionNote:
      'If expert re-examination is needed the period may be extended; we will tell you the reason in advance.',
    typesHead: 'How each type is handled',
    types: [
      {
        title: 'Procedural errors',
        body: 'Administrative mistakes in receipt, omission or announcement are checked and corrected immediately.',
      },
      {
        title: 'Factual errors',
        body: 'Errors in entrant or artwork details are corrected once supporting documents are checked.',
      },
      {
        title: 'Verification requests',
        body: 'Requests to verify on-site calligraphy results or compare against originals may be re-examined by resolution of the jury or the organizing committee.',
      },
    ],
    dismissalsHead: 'When an objection may not be accepted',
    dismissals: [
      'It is submitted after the deadline',
      'Required information is missing, so it cannot be reviewed',
      "It is simply a complaint about a juror's subjective evaluation (score)",
      'It is clearly intended as groundless defamation, personal attack or obstruction',
    ],
    sources: ['Objection Regulations Art. 2', 'Art. 3', 'Art. 4', 'Art. 5', 'Art. 6', 'Art. 7'],
  },
  address: {
    eyebrow: 'Address',
    title: 'Headquarters and office',
    lede: 'The office handles entry forms and all administration. Please use the office address when sending documents.',
    officeLabel: 'Office',
    headquartersLabel: 'Headquarters',
    officeRole: 'Entry forms · Administration',
    map: 'View on Kakao Map',
    sources: ['Articles of Incorporation Art. 38'],
  },
  events: {
    eyebrow: 'Events',
    title: 'Events and exhibitions',
    lede: 'See upcoming events and exhibitions, and register for the ones you would like to attend.',
  },
  faq: { eyebrow: 'FAQ', title: 'Check these before you ask' },
  citeLabel: 'Source',
}

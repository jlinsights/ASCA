/** 제23회 공모요강 요약 — 영어. 사실은 원본에서 읽고 문장만 옮긴다 */

import Link from 'next/link'
import { CONTEST_23 } from './contest-23-data'
import { CONTEST_FACTS, contestDate, contestTitle, contestVenue, formatWon } from './contest-i18n'
import type { GuidelineCopy } from './contest-23-copy'
import {
  Account,
  CEREMONY_END,
  CEREMONY_START,
  DEADLINE_TIME,
  HALLS_NOTE,
  Holder,
  MailTo,
  SPECIAL_FEES,
  foreignAwards,
  foreignDivisions,
  foreignFees,
  foreignSizes,
} from './contest-23-tables'

export function enGuidelines(): GuidelineCopy {
  const d = (iso: string, withYear = true) => contestDate(iso, 'en', withYear)
  const title = contestTitle('en')
  const venue = contestVenue('en')
  const facts = CONTEST_FACTS.en
  return {
    title,
    next: {
      eyebrow: 'Schedule',
      title,
      lede: `Entries close ${d(CONTEST_23.deadline)} at ${DEADLINE_TIME} (by arrival). The full guidelines are in the flipbook above.`,
      caption: `${title} schedule`,
      columns: ['Item', 'Details'],
      rows: [
        {
          label: 'Entry deadline',
          value: `${d(CONTEST_23.deadline)}, arriving by ${DEADLINE_TIME} — mailed entries count by the date they arrive`,
          lead: true,
        },
        {
          label: 'First judging (works)',
          value: `${d(CONTEST_23.firstJudging)} · Selections and prize candidates confirmed`,
        },
        {
          label: 'Second judging (live brushwork)',
          value: `${d(CONTEST_23.secondJudging)} · Prize candidates write on site to settle the Grand Prize and final awards`,
        },
        {
          label: 'Results',
          value: 'Posted on the association website after judging, with individual notice',
        },
        {
          label: 'Exhibition',
          value: `${d(CONTEST_23.exhibitionStart)} – ${d(CONTEST_23.exhibitionEnd, false)} · Free admission · Closed ${d(CONTEST_23.closedDay, false)}`,
        },
        {
          label: 'Opening & award ceremony',
          value: `${d(CONTEST_23.ceremony)} ${CEREMONY_START}–${CEREMONY_END} · Prize winners attend in person`,
        },
        { label: 'Venue', value: `${venue}, Galleries 1 & 2` },
        {
          label: 'Collecting works',
          value: `${d(CONTEST_23.exhibitionEnd)} during take-down, at the exhibition hall`,
        },
      ],
    },
    nextNote: `Organizer ${facts.host} · Sponsors ${facts.sponsors} · Galleries ${HALLS_NOTE.en}`,
    entry: {
      eyebrow: 'Eligibility & sections',
      title: 'Who can enter, and with what',
      lede: 'Five sections, centred on Hangeul and Chinese-character calligraphy and reaching literati painting, seal engraving, contemporary calligraphy and calligraphy art.',
      rules: [
        {
          title: 'Open to all',
          body: 'Korean citizens, overseas Koreans and foreign residents of Korea who practice calligraphy, literati painting or seal engraving. There are no limits on age, education or experience.',
        },
        {
          title: 'Young artists',
          body: 'Entries from university calligraphy majors and young artists who are or were members of the National University Calligraphy Federation are encouraged. The youth section is judged on separate criteria.',
        },
        {
          title: 'Invited artists',
          body: 'Invited artists of the association cannot enter the open-call sections; they submit to the Invited Artists Exhibition in Gallery 1.',
        },
        {
          title: 'Special provision',
          body: `Under a special provision new for this edition, skilled artists who are not full members may join the Invited Artists Exhibition. To obtain recommended or invited artist status, apply for special appointment under Article 11 of the regulations on appointing recommended and invited artists (for non-members, the judging fee, registration fee and first-year dues total ${formatWon(SPECIAL_FEES.recommended, 'en')} for recommended artists and ${formatWon(SPECIAL_FEES.invited, 'en')} for invited artists).`,
        },
        {
          title: 'Ineligible works',
          body: 'Works already selected or awarded in another competition, previously published works, works made by someone else, and copies of classics (imseo) presented as original work.',
        },
      ],
      divisions: foreignDivisions('en'),
      note: 'The board of directors may add judging sections by resolution if needed.',
    },
    specs: {
      eyebrow: 'Size & mounting',
      title: 'Preparing your work',
      lede: 'Make the work in one of three sizes. Seal and wood engraving follow separate sizes.',
      sizes: foreignSizes('en'),
      caption: 'Number of works and mounting',
      rows: [
        {
          label: 'Number of works',
          value:
            'At least 1 and up to 9 per person · With two or more you may enter different sections; each work is judged separately',
        },
        {
          label: 'Mounting',
          value:
            'Submit backed (baejeop, 褙接) but unframed · Finished mountings (frames, hanging scrolls, folding screens) and works under glass are not accepted',
        },
        {
          label: 'Seal & signature',
          value: 'Seal and signature required · Seal stamp recommended',
        },
        {
          label: 'Labeling',
          value:
            'Attach the label (Form 2) to the lower right of the back — section, name, title, script, size, contact',
        },
      ],
    },
    fees: {
      eyebrow: 'Entry fees',
      title: 'Entry fees and payment account',
      lede: 'From the second work the fee per work goes down. Mounting fees apply only to works selected or higher.',
      caption: 'Entry fees (mounting fee separate)',
      columns: [
        { label: 'Category' },
        { label: '1 work', numeric: true },
        { label: '2–9 works (each)', numeric: true },
      ],
      rows: foreignFees('en'),
    },
    feesNote: (
      <>
        Account <Account lang='en' /> · Holder <Holder /> · Please send the payment receipt with
        your entry application. For mounting fees and solo or group booth exhibitions of 10 or more
        works, see the <Link href='/application#fees'>entry form</Link> and the guidelines.
      </>
    ),
    how: {
      eyebrow: 'How to enter',
      title: 'Submitting your entry',
      lede: `Entries close ${d(CONTEST_23.deadline)} at ${DEADLINE_TIME}, counted by the date they arrive, not the date sent.`,
      rules: [
        {
          title: 'Register online first',
          body: 'Register through the entry form on the association website, then send your work.',
        },
        {
          title: 'Documents',
          body: '① Entry application (Form 1) ② Label for the back of the work (Form 2) ③ Proof of entry-fee payment ④ For contemporary calligraphy and calligraphy art, an artist’s note (recommended)',
        },
        { title: 'Where to send', body: <MailTo /> },
        {
          title: 'Shipping',
          body: 'Shipping costs and risks are borne by the entrant; submitted works and documents are not returned.',
        },
      ],
    },
    howNote: (
      <>
        <Link href='/application'>Fill in the entry form →</Link> The entry application (Form 1) and
        label (Form 2) can be downloaded from pages 5–8 of the guidelines and from the entry form
        page.
      </>
    ),
    prizes: {
      eyebrow: 'Awards',
      title: 'Prizes',
      lede: `The award ceremony is held ${d(CONTEST_23.ceremony)} at ${CEREMONY_START}, ${venue}.`,
      caption: 'Prizes',
      columns: [
        { label: 'Award' },
        { label: 'Category' },
        { label: 'Number' },
        { label: 'Certificate & prize' },
      ],
      rows: foreignAwards('en'),
    },
    prizesNote:
      'Special Selection and Selected works are exhibited and included in the catalogue. Award records count toward appointment as a recommended or invited artist.',
    notice: {
      eyebrow: 'Notes',
      title: 'Please check before entering',
      items: [
        `Works are collected on site during take-down on the last day of the exhibition (${d(CONTEST_23.exhibitionEnd)}); the association is not responsible for works left uncollected.`,
        'The association may include entries in its catalogue, promotional materials and online archive; copyright stays with the artist.',
        'If a rule violation is confirmed, selections and awards may be cancelled and the result made public.',
        'Artists who wish to sell may do so under the association’s consignment contract (70% to the artist).',
        'Judging criteria (technique, composition, creativity, completeness) follow the association’s judging regulations, and objections to results are not accepted. Grades and numbers are adjusted if entries fall short of the standard.',
        'A mounting fee is charged for works selected or higher (hand-backing as standard, at member rates). Prize money is paid after tax.',
        'Anything not covered here follows decisions of the association’s board of directors and steering committee.',
      ],
    },
  }
}

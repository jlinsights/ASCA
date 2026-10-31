/** 제23회 공모요강 요약 — 일본어. 사실은 원본에서 읽고 문장만 옮긴다 */

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

export function jaGuidelines(): GuidelineCopy {
  const d = (iso: string, withYear = true) => contestDate(iso, 'ja', withYear)
  const title = contestTitle('ja')
  const venue = contestVenue('ja')
  const facts = CONTEST_FACTS.ja
  return {
    title,
    next: {
      eyebrow: '公募日程',
      title,
      lede: `出品受付は${d(CONTEST_23.deadline)} ${DEADLINE_TIME}必着です。公募要項の全文は上のフリップブックでご覧いただけます。`,
      caption: `${title} 日程`,
      columns: ['区分', '内容'],
      rows: [
        {
          label: '出品受付締切',
          value: `${d(CONTEST_23.deadline)} ${DEADLINE_TIME}必着 — 郵送は締切日必着`,
          lead: true,
        },
        { label: '第1次作品審査', value: `${d(CONTEST_23.firstJudging)} · 入選・受賞予定者を確定` },
        {
          label: '第2次揮毫審査大会',
          value: `${d(CONTEST_23.secondJudging)} · 受賞予定者の現場揮毫で大賞などを最終決定`,
        },
        { label: '結果発表', value: '審査終了後、協会ホームページに掲載し個別に通知' },
        {
          label: '展示',
          value: `${d(CONTEST_23.exhibitionStart)} 〜 ${d(CONTEST_23.exhibitionEnd, false)} · 観覧無料 · ${d(CONTEST_23.closedDay, false)} 定期休館`,
        },
        {
          label: '開幕・授賞式',
          value: `${d(CONTEST_23.ceremony)} ${CEREMONY_START}〜${CEREMONY_END} · 受賞者本人の出席が原則`,
        },
        { label: '会場', value: `${venue} 第1・第2展示室` },
        { label: '作品搬出', value: `${d(CONTEST_23.exhibitionEnd)} 撤収時間、展示会場にて` },
      ],
    },
    nextNote: `主催・主管 ${facts.host} · 後援 ${facts.sponsors} · 展示室 ${HALLS_NOTE.ja}`,
    entry: {
      eyebrow: '出品資格・部門',
      title: '誰が、何を出品するか',
      lede: 'ハングル・漢文の書芸を中心に、文人画・篆刻・現代書芸・カリグラフィーまでの5部門です。',
      rules: [
        {
          title: '誰でも',
          body: '書芸・文人画・篆刻を修練する大韓民国国民、在外同胞、韓国在住の外国人。年齢・学歴・経歴の制限はありません。',
        },
        {
          title: '青年作家',
          body: '大学の書芸専攻者と、全国大学書芸連合に所属・出身の青年作家の出品を推奨します。青年部は別の審査基準を適用します。',
        },
        {
          title: '招待作家',
          body: '協会の招待作家は公募部門に出品できず、第1展示室の招待作家展部門に出品します。',
        },
        {
          title: '特別規定',
          body: `今回新設した特別規定により、協会の正会員でなくても実力のある作家は招待作家展に参加できます。推薦・招待作家の資格を得るには、推薦・招待作家選任規程第11条の特別選任を申請します(非会員は審査料・登録費・初年度年会費の合計で推薦作家${formatWon(SPECIAL_FEES.recommended, 'ja')}、招待作家${formatWon(SPECIAL_FEES.invited, 'ja')})。`,
        },
        {
          title: '出品できない作品',
          body: '他の公募展で入選・受賞した作品、既に発表した作品、代作、臨書を創作と表記した作品。',
        },
      ],
      divisions: foreignDivisions('ja'),
      note: '必要に応じて理事会の議決で審査部門を追加できます。',
    },
    specs: {
      eyebrow: '作品規格・表装',
      title: '作品の準備',
      lede: '3つの規格のいずれかで制作します。篆刻・書刻部門は別の規格に従います。',
      sizes: foreignSizes('ja'),
      caption: '出品点数と表装',
      rows: [
        {
          label: '出品点数',
          value: '1人1点以上、最大9点 · 2点以上なら部門を変えることができ、審査は1点ごとに行います',
        },
        {
          label: '表装',
          value:
            '裏打ち(褙接)後、未表具の状態で提出 · 額・掛軸・屏風など完成表具やガラスを使った作品は受け付けません',
        },
        { label: '落款・署名', value: '落款と署名は必須 · 印章の使用を推奨' },
        {
          label: '作品表記',
          value:
            '作品裏面の右下に表記紙(別紙第2号)を貼ります — 部門・氏名・作品名・書体・規格・連絡先',
        },
      ],
    },
    fees: {
      eyebrow: '出品料',
      title: '出品料と振込口座',
      lede: '2点目からは1点あたりの金額が下がります。表具費は入選以上の作品にのみ別途かかります。',
      caption: '出品料(表具費別途)',
      columns: [
        { label: '区分' },
        { label: '作品1点', numeric: true },
        { label: '2〜9点(1点あたり)', numeric: true },
      ],
      rows: foreignFees('ja'),
    },
    feesNote: (
      <>
        振込口座 <Account lang='ja' /> · 口座名義 <Holder /> ·
        振込確認書を出品申請書と一緒にお送りください。表具費と10点以上の個展・団体ブース展は
        <Link href='/application#fees'>出品願書</Link>と公募要項をご確認ください。
      </>
    ),
    how: {
      eyebrow: '出品方法',
      title: '受付の流れ',
      lede: `締切は${d(CONTEST_23.deadline)} ${DEADLINE_TIME}、発送日ではなく到着日が基準です。`,
      rules: [
        {
          title: 'オンライン事前登録',
          body: '協会ホームページの出品願書で先に登録してから作品を送ります。',
        },
        {
          title: '提出書類',
          body: '① 出品申請書(別紙第1号) ② 作品裏面の表記紙(別紙第2号) ③ 出品料の振込確認書 ④ 現代書芸・カリグラフィー部門は作家ノート(推奨)',
        },
        { title: '受付先', body: <MailTo /> },
        {
          title: '運送',
          body: '運送費用とリスクは出品者の負担とし、受け付けた作品と書類は返却しません。',
        },
      ],
    },
    howNote: (
      <>
        <Link href='/application'>出品願書を作成する →</Link>{' '}
        出品申請書(別紙第1号)と表記紙(別紙第2号)の様式は、公募要項5〜8ページと出品願書ページからダウンロードできます。
      </>
    ),
    prizes: {
      eyebrow: '授賞',
      title: '授賞内訳',
      lede: `授賞式は${d(CONTEST_23.ceremony)} ${CEREMONY_START}、${venue}で行われます。`,
      caption: '授賞内訳',
      columns: [{ label: '賞格' }, { label: '区分' }, { label: '人数' }, { label: '賞状・賞金' }],
      rows: foreignAwards('ja'),
    },
    prizesNote:
      '特選・入選作品は図録に掲載され、展示されます。受賞実績は推薦・招待作家選任の配点に反映します。',
    notice: {
      eyebrow: '注意事項',
      title: '出品前に必ずご確認ください',
      items: [
        `作品の搬出は展示終了日(${d(CONTEST_23.exhibitionEnd)})の撤収時間に会場で行い、引き取られなかった作品の保管責任は協会が負いません。`,
        '協会は出品作を図録・広報物・オンラインアーカイブに掲載することがあり、著作権は作家にあります。',
        '規定違反が確認された場合、入選・受賞を取り消し、結果を公開することがあります。',
        '作品の販売を希望する場合は、協会の委託販売契約(作家70%精算)で進めることができます。',
        '審査基準(法度・造形・創意・完成度)は協会の審査規程に従い、結果への異議は受け付けません。水準に満たない場合は等級・人数を調整します。',
        '入選以上の作品には表具費がかかります(手裏打ちが原則、会員価格適用)。賞金は税金控除後に支給します。',
        '記載のない事項は協会理事会と運営委員会の決定に従います。',
      ],
    },
  }
}

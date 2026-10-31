/** 제23회 공모요강 요약 — 중국어(번체). 사실은 원본에서 읽고 문장만 옮긴다 */

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

export function zhGuidelines(): GuidelineCopy {
  const d = (iso: string, withYear = true) => contestDate(iso, 'zh', withYear)
  const title = contestTitle('zh')
  const venue = contestVenue('zh')
  const facts = CONTEST_FACTS.zh
  return {
    title,
    next: {
      eyebrow: '公募日程',
      title,
      lede: `收件至${d(CONTEST_23.deadline)} ${DEADLINE_TIME}寄達為止。公募簡章全文請見上方翻頁電子書。`,
      caption: `${title} 日程`,
      columns: ['項目', '內容'],
      rows: [
        {
          label: '收件截止',
          value: `${d(CONTEST_23.deadline)} ${DEADLINE_TIME}前寄達 — 郵寄以截止日寄達為準`,
          lead: true,
        },
        {
          label: '第一階段作品審查',
          value: `${d(CONTEST_23.firstJudging)} · 確定入選及預定得獎者`,
        },
        {
          label: '第二階段揮毫審查大會',
          value: `${d(CONTEST_23.secondJudging)} · 預定得獎者現場揮毫，最終確定大獎等獎項`,
        },
        { label: '公布結果', value: '審查結束後於協會網站公告並個別通知' },
        {
          label: '展覽',
          value: `${d(CONTEST_23.exhibitionStart)} 至 ${d(CONTEST_23.exhibitionEnd, false)} · 免費參觀 · ${d(CONTEST_23.closedDay, false)} 定期休館`,
        },
        {
          label: '開幕暨頒獎典禮',
          value: `${d(CONTEST_23.ceremony)} ${CEREMONY_START}至${CEREMONY_END} · 得獎者原則上須親自出席`,
        },
        { label: '地點', value: `${venue} 第1・第2展覽室` },
        { label: '作品取回', value: `${d(CONTEST_23.exhibitionEnd)} 撤展時間，於展場現場` },
      ],
    },
    nextNote: `主辦 ${facts.host} · 贊助 ${facts.sponsors} · 展覽室 ${HALLS_NOTE.zh}`,
    entry: {
      eyebrow: '出品資格・部門',
      title: '誰可以出品、出品什麼',
      lede: '以韓文、漢文書藝為中心，涵蓋文人畫、篆刻、現代書藝與手寫字藝術，共五個部門。',
      rules: [
        {
          title: '所有人',
          body: '修習書藝、文人畫、篆刻的大韓民國國民、海外僑胞及居住韓國的外國人。不限年齡、學歷與經歷。',
        },
        {
          title: '青年作家',
          body: '鼓勵大學書藝主修者，以及全國大學書藝聯合所屬或出身的青年作家參賽。青年組採用另訂的審查標準。',
        },
        {
          title: '邀請作家',
          body: '協會邀請作家不得參加公募部門，須以第1展覽室邀請作家展部門出品。',
        },
        {
          title: '特別規定',
          body: `依本屆新設之特別規定，非協會正式會員但具實力的作家亦可參加邀請作家展。欲取得推薦・邀請作家資格者，請依推薦・邀請作家選任規程第11條申請特別選任(非會員之審查費、登記費及首年年費合計：推薦作家${formatWon(SPECIAL_FEES.recommended, 'zh')}、邀請作家${formatWon(SPECIAL_FEES.invited, 'zh')})。`,
        },
        {
          title: '不得出品的作品',
          body: '曾於其他公募展入選或得獎的作品、已發表的作品、代筆作品，以及將臨書標示為創作的作品。',
        },
      ],
      divisions: foreignDivisions('zh'),
      note: '必要時得經理事會決議增設審查部門。',
    },
    specs: {
      eyebrow: '作品規格・裝裱',
      title: '作品準備方式',
      lede: '請以三種規格之一製作。篆刻・書刻部門另依其規格。',
      sizes: foreignSizes('zh'),
      caption: '出品件數與裝裱',
      rows: [
        { label: '出品件數', value: '每人1件以上、最多9件 · 2件以上可選不同部門，每件分別審查' },
        {
          label: '裝裱',
          value: '托裱(褙接)後以未裝框狀態提交 · 不受理裱框、掛軸、屏風等完成裝裱或使用玻璃的作品',
        },
        { label: '落款・署名', value: '必須落款及署名 · 建議使用印章' },
        {
          label: '作品標示',
          value: '於作品背面右下角黏貼標示紙(附表第2號) — 部門、姓名、作品名、書體、規格、聯絡方式',
        },
      ],
    },
    fees: {
      eyebrow: '出品費',
      title: '出品費與匯款帳戶',
      lede: '第2件起每件金額調降。裝裱費僅對入選以上作品另行收取。',
      caption: '出品費(裝裱費另計)',
      columns: [
        { label: '類別' },
        { label: '作品1件', numeric: true },
        { label: '2至9件(每件)', numeric: true },
      ],
      rows: foreignFees('zh'),
    },
    feesNote: (
      <>
        匯款帳戶 <Account lang='zh' /> · 戶名 <Holder /> ·
        請將匯款證明與出品申請書一併寄送。裝裱費以及10件以上個展、團體攤位展，請參閱
        <Link href='/application#fees'>出品申請</Link>與公募簡章。
      </>
    ),
    how: {
      eyebrow: '出品方式',
      title: '收件流程',
      lede: `截止時間為${d(CONTEST_23.deadline)} ${DEADLINE_TIME}，以寄達日而非寄出日為準。`,
      rules: [
        { title: '線上預先登記', body: '請先透過協會網站的出品申請表登記，再寄送作品。' },
        {
          title: '提交文件',
          body: '① 出品申請書(附表第1號) ② 作品背面標示紙(附表第2號) ③ 出品費匯款證明 ④ 現代書藝・手寫字藝術部門附作家筆記(建議)',
        },
        { title: '收件地址', body: <MailTo /> },
        { title: '運送', body: '運費與風險由出品者自行負擔，收件後的作品與文件恕不退還。' },
      ],
    },
    howNote: (
      <>
        <Link href='/application'>填寫出品申請 →</Link>{' '}
        出品申請書(附表第1號)與標示紙(附表第2號)表格，可於公募簡章第5至8頁及出品申請頁面下載。
      </>
    ),
    prizes: {
      eyebrow: '頒獎',
      title: '獎項內容',
      lede: `頒獎典禮於${d(CONTEST_23.ceremony)} ${CEREMONY_START}在${venue}舉行。`,
      caption: '獎項內容',
      columns: [{ label: '獎項' }, { label: '類別' }, { label: '名額' }, { label: '獎狀・獎金' }],
      rows: foreignAwards('zh'),
    },
    prizesNote: '特選、入選作品將展出並刊登於圖錄。得獎紀錄將計入推薦・邀請作家選任之評分。',
    notice: {
      eyebrow: '注意事項',
      title: '出品前請務必確認',
      items: [
        `作品須於展覽結束日(${d(CONTEST_23.exhibitionEnd)})撤展時間至現場取回，未取回作品之保管責任協會概不負責。`,
        '協會得將出品作品刊登於圖錄、宣傳品及線上典藏，著作權歸作家所有。',
        '經確認違反規定者，得取消入選或得獎資格並公開結果。',
        '如欲出售作品，可透過協會寄售契約辦理(作家分得70%)。',
        '審查標準(法度、造形、創意、完成度)依協會審查規程，結果恕不接受異議。若作品水準不足，將調整等級與名額。',
        '入選以上作品須支付裝裱費(原則上手工托裱，適用會員價)。獎金扣除稅金後發放。',
        '未盡事項依協會理事會及營運委員會之決定辦理。',
      ],
    },
  }
}

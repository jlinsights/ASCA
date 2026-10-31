import type { Language } from '@/lib/i18n/types'

/**
 * /artists 맨 위 — 홈페이지를 가진 작가와 書境 개인전·부스전·홈페이지 안내.
 * 비용 숫자는 쓰지 않는다. 숫자는 회원 및 회비 규정과 자주 묻는 질문 한 곳에만 둔다.
 * ja·zh 는 원어민 검토 전이다.
 */
const ko = {
  eyebrow: '작가의 홈페이지',
  title: '작품이 머무는 집을 가진 작가',
  lede: '개인 홈페이지에서 작품과 전시 기록을 이어 가는 작가들입니다. 아래 홈페이지는 협회 사무국이 구축하고 운영합니다. 협회의 작가 소개와 작가 본인의 홈페이지를 함께 볼 수 있습니다.',
  visit: '홈페이지',
  groupSite: '작가가 이끄는 단체 홈페이지',
  renewed: '홈페이지 새 단장',
  profile: '작가 소개',
  newWindow: '(새 창)',
  inviteEyebrow: '書境 초대작가전 · 개인전 · 부스전',
  inviteTitle: '한 번의 전시가 오래 남는 기록이 되도록',
  inviteBody:
    '제23회 대전 기간에 書境 초대작가전과 함께 10점 이상의 개인전과 서예 단체의 부스전을 엽니다. 회원 및 회비 규정은 개인전 출품 수량에 따라 개인 홈페이지의 구축비와 유지보수비를 정해 두었습니다. 전시가 끝난 뒤에도 작품은 작가의 주소에 남습니다. 개인 홈페이지와 작가가 이끄는 단체의 홈페이지 모두 사무국이 구축과 운영을 맡습니다.',
  linkShogyeong: '書境 출품 경로',
  linkEntryFees: '개인전·부스전 출품료',
  linkHomepageRule: '홈페이지 비용 (회원 및 회비 규정 제10조)',
  linkBenefitRule: '출품 수량에 따른 감면 (제10조의2)',
  contact: '사무국에 상담하기',
  faqToggle: '비용 자세히 보기',
}

type FeaturedCopy = typeof ko

const en: FeaturedCopy = {
  eyebrow: 'Artist websites',
  title: 'Artists with a home for their work',
  lede: 'These artists keep their works and exhibition records on their own websites, built and run by the Society’s secretariat. See the Society profile and the artist’s own site side by side.',
  visit: 'Website',
  groupSite: 'Website of the group the artist leads',
  renewed: 'Website renewed',
  profile: 'Profile',
  newWindow: '(opens in a new window)',
  inviteEyebrow: '書境 Invited Artists · Solo · Booth exhibitions',
  inviteTitle: 'So that one exhibition becomes a lasting record',
  inviteBody:
    'During the 23rd Grand Exhibition, solo exhibitions of 10 or more works and booth exhibitions by calligraphy groups open alongside the 書境 Invited Artists Exhibition. The Membership and Dues Regulations set the cost of building and maintaining a personal website by the number of works in a solo exhibition. The works stay at the artist’s own address after the exhibition closes. The secretariat builds and runs both personal websites and websites for the groups artists lead.',
  linkShogyeong: 'How to enter 書境',
  linkEntryFees: 'Solo and booth entry fees',
  linkHomepageRule: 'Website costs (Membership and Dues, Art. 10)',
  linkBenefitRule: 'Reductions by number of works (Art. 10-2)',
  contact: 'Talk to the secretariat',
  faqToggle: 'See the costs',
}

const ja: FeaturedCopy = {
  eyebrow: '作家のホームページ',
  title: '作品の住まいを持つ作家',
  lede: '個人ホームページで作品と展覧会の記録を続けている作家です。以下のホームページは協会事務局が制作・運営しています。協会の作家紹介と作家ご本人のホームページをあわせてご覧いただけます。',
  visit: 'ホームページ',
  groupSite: '作家が率いる団体のホームページ',
  renewed: 'ホームページ リニューアル',
  profile: '作家紹介',
  newWindow: '（新しいウィンドウ）',
  inviteEyebrow: '書境 招待作家展 · 個展 · ブース展',
  inviteTitle: '一度の展覧会が、長く残る記録となるように',
  inviteBody:
    '第23回大展の会期中、書境 招待作家展とともに10点以上の個展と書道団体のブース展を開きます。会員及び会費規程は、個展の出品点数に応じて個人ホームページの制作費と保守費を定めています。展覧会が終わった後も、作品は作家のアドレスに残ります。個人ホームページも、作家が率いる団体のホームページも、事務局が制作と運営を担います。',
  linkShogyeong: '書境への出品方法',
  linkEntryFees: '個展・ブース展の出品料',
  linkHomepageRule: 'ホームページ費用（会員及び会費規程 第10条）',
  linkBenefitRule: '出品点数による減免（第10条の2）',
  contact: '事務局に相談する',
  faqToggle: '費用の詳細',
}

const zh: FeaturedCopy = {
  eyebrow: '作家的網站',
  title: '為作品安了家的作家',
  lede: '這些作家在個人網站上持續記錄作品與展覽。以下網站由協會事務局建置與營運。可同時瀏覽協會的作家介紹與作家本人的網站。',
  visit: '網站',
  groupSite: '作家帶領的團體網站',
  renewed: '網站全新改版',
  profile: '作家介紹',
  newWindow: '（新視窗）',
  inviteEyebrow: '書境 邀請作家展 · 個展 · 攤位展',
  inviteTitle: '讓一次展覽成為長久留存的紀錄',
  inviteBody:
    '第23屆大展期間，與書境邀請作家展同時舉辦10件以上的個展及書藝團體的攤位展。會員及會費規程依個展出品件數，訂定個人網站的建置費與維護費。展覽結束後，作品仍留在作家的網址上。個人網站與作家帶領的團體網站，皆由事務局負責建置與營運。',
  linkShogyeong: '書境出品途徑',
  linkEntryFees: '個展・攤位展出品費',
  linkHomepageRule: '網站費用（會員及會費規程 第10條）',
  linkBenefitRule: '依出品件數減免（第10條之2）',
  contact: '洽詢事務局',
  faqToggle: '查看費用',
}

export const featuredHomepagesCopy: Record<Language, FeaturedCopy> = { ko, en, ja, zh }

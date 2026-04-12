export interface BylawsSection {
  id: string
  title: string
  titleEn: string
  enforcementDate?: string
  googleDocsUrl: string
  infographicSrc?: string
}

export const BYLAWS_SECTIONS: BylawsSection[] = [
  {
    id: 'Articles-of-Incorporation',
    title: '정 관',
    titleEn: 'Articles of Incorporation',
    googleDocsUrl:
      'https://docs.google.com/document/d/1on5DqNNLBXvr_wvvapz5zhWFPR1dPlHKaZ6y3bgIWuE/edit?usp=sharing',
    infographicSrc: '/webflow/orientalcalligraphy/images/한눈에-보는-운영-가이드.png',
  },
  {
    id: 'Regulations-on-Membership-and-Dues',
    title: '회원 및 회비',
    titleEn: 'Regulations on Membership and Dues',
    enforcementDate: '시행 2026. 1. 1.',
    googleDocsUrl:
      'https://docs.google.com/document/d/1LqwokChxq-7qgus7B3ntAKl2skP-Ch31co7kyDs4RDE/edit?usp=sharing',
    infographicSrc:
      '/webflow/orientalcalligraphy/images/동양서예협회-회원-등급-및-회비-안내_Simple.png',
  },
  {
    id: 'Regulations-on-Operation-and-Review',
    title: '운영 및 심사',
    titleEn: 'Regulations on Operation and Review',
    enforcementDate: '시행 2025. 2. 8. / 제3호 시행령, 2026. 1. 1., 일부개정',
    googleDocsUrl:
      'https://docs.google.com/document/d/1x65nBE0Auk-_8UMF0sWpBpbyyI3aKmYKwGGo_Htvenw/edit?usp=sharing',
    infographicSrc: '/webflow/orientalcalligraphy/images/동양서예협회-2026년-운영-가이드.png',
  },
  {
    id: 'Regulations-on-Exhibition-Management-and-Operation',
    title: '전시 관리 및 운영',
    titleEn: 'Regulations on Exhibition Management and Operation',
    enforcementDate: '시행 2026. 1. 1. / 제1호 시행령, 2026. 1. 1., 신규 개정',
    googleDocsUrl:
      'https://docs.google.com/document/d/1x65nBE0Auk-_8UMF0sWpBpbyyI3aKmYKwGGo_Htvenw/edit?usp=sharing',
    infographicSrc: '/webflow/orientalcalligraphy/images/2026-전시-운영-및-혜택-안내.png',
  },
  {
    id: 'Regulations-on-the-Appointment-of-Recommended-and-Invited-Artists',
    title: '추천ㆍ초대작가 선임',
    titleEn: 'Regulations on the Appointment of Recommended and Invited Artists',
    enforcementDate: '시행 2023. 8. 23. / 제3호 시행령, 2026. 1. 1., 일부 개정',
    googleDocsUrl:
      'https://docs.google.com/document/d/1dOtCRVEsBZ0dW87lynU-ZulnvaxThhD6vU-28i9tBPY/edit?usp=sharing',
    infographicSrc: '/webflow/orientalcalligraphy/images/추천·초대작가-등록-안내.png',
  },
  {
    id: 'Regulations-on-Artwork-Appraisal-and-Certificate-Issuance',
    title: '작품 감정 및 보증서 발행',
    titleEn: 'Regulations on Artwork Appraisal and Certificate Issuance',
    enforcementDate: '시행 2026. 2. 13. / 제1호 시행령, 2026. 2. 13., 신규 개정',
    googleDocsUrl:
      'https://docs.google.com/document/d/1zyRHlG-PqJ2QqAHVqzUNHX5I0ztp4uzIP_YCkAuUrOk/edit?usp=sharing',
    infographicSrc: '/webflow/orientalcalligraphy/images/서예-작품-가치-증명-안내.png',
  },
  {
    id: 'Regulations-on-the-Establishment-and-Operation-of-Branches-and-Chapters',
    title: '지부 및 지회 설치·운영',
    titleEn: 'Regulations on the Establishment and Operation of Branches and Chapters',
    enforcementDate: '시행 2026. 2. 13. / 제1호 시행령, 2026. 2. 13., 신규 개정',
    googleDocsUrl:
      'https://docs.google.com/document/d/1FcfkmNNn5B2aE6bTcFsZFC6_c7oxHRuU3nDSxsuY2io/edit?usp=sharing',
    infographicSrc: '/webflow/orientalcalligraphy/images/서예협회-지부·지회-운영-핵심.png',
  },
  {
    id: 'Regulations-on-the-Handling-of-Objections',
    title: '이의제기 처리',
    titleEn: 'Regulations on the Handling of Objections',
    enforcementDate: '시행 2026. 2. 13. / 제1호 시행령, 2026. 2. 13., 신규 개정',
    googleDocsUrl:
      'https://docs.google.com/document/d/11wOw1oh2jkUiDMWgFfhf90SOaub7hgJ_LsUZErFeaOc/edit?usp=sharing',
    infographicSrc: '/webflow/orientalcalligraphy/images/서예협회-이의제기-처리-절차.png',
  },
  {
    id: 'Qualification-and-Requirements',
    title: '자격 및 요건',
    titleEn: 'Qualifications and Requirements for Membership',
    googleDocsUrl:
      'https://docs.google.com/document/d/11QaAkGRr7-hPlYZ5V_n2QzHCoT2Mi9IkNz6-LO-VEdQ/edit?usp=sharing',
    infographicSrc: '/webflow/orientalcalligraphy/images/동양서예협회-회원-가입-승급-가이드.png',
  },
]

export const QUICK_LINKS = [
  { href: '/introductions', label: '소 개' },
  { href: '/mission', label: '사 명' },
  { href: '/history', label: '연 혁' },
  { href: '/board-members', label: '임 원' },
  { href: '/academy', label: '강 좌' },
  { href: '/forms', label: '서 식' },
  { href: '/partners', label: '협력기관' },
  { href: '/business-plan', label: '사업계획' },
  { href: '/terms-of-service', label: '이용약관' },
  { href: '/privacy-policy', label: '개인정보처리방침' },
]

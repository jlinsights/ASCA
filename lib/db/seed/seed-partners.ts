import { db } from '@/lib/db'
import { partners } from '@/lib/db/schema'

const partnerData = [
  {
    id: 'munhwa-cheyuk',
    name: '문화체육관광부',
    nameEn: 'Ministry of Culture, Sports and Tourism',
    nameCn: '文化体育观光部',
    nameJp: '文化体育観光部',
    category: 'government' as const,
    description:
      '대한민국의 문화, 체육, 관광 분야를 총괄하는 중앙행정기관으로, 서예를 포함한 전통문화 예술의 진흥과 지원을 담당합니다. 동양서예협회는 문화체육관광부 산하 사단법인으로 등록되어 있습니다.',
    descriptionEn: 'Central government agency overseeing culture, sports, and tourism in Korea.',
    website: 'https://www.mcst.go.kr',
    address: '세종특별자치시 어진동 388',
    phone: '044-203-2000',
    relationshipType: '주무부처',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'yechong',
    name: '한국예술문화단체총연합회',
    nameEn: 'Korean Federation of Artistic & Cultural Organizations',
    category: 'government' as const,
    description:
      '대한민국의 예술문화 분야 최상위 연합 단체로, 10개 예술 분야의 협회가 소속되어 있습니다.',
    website: 'http://www.yechong.or.kr/',
    address: '서울특별시 강남구 테헤란로 7길 22',
    phone: '02-741-0281',
    relationshipType: '상급단체',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'arko',
    name: '한국문화예술위원회',
    nameEn: 'Arts Council Korea',
    category: 'government' as const,
    description:
      '문화예술 진흥을 위한 사업과 활동을 지원하는 기관으로, 전시 및 문화교류 프로그램에 대한 지원을 받고 있습니다.',
    website: 'https://www.arko.or.kr/',
    address: '서울특별시 종로구 대학로 116 예술가의집',
    phone: '02-760-4500',
    relationshipType: '지원기관',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'sac',
    name: '예술의전당',
    nameEn: 'Seoul Arts Center',
    nameCn: '艺术的殿堂',
    nameJp: '芸術の殿堂',
    category: 'museum' as const,
    description:
      '대한민국을 대표하는 종합예술기관으로, 서예박물관을 운영하며 매년 다수의 서예 기획전과 초대전을 개최합니다. 동양서예협회는 이곳에서 연례 동양서예대전을 개최합니다.',
    descriptionEn:
      "Korea's premier arts complex, home to the Calligraphy Museum and annual calligraphy exhibitions.",
    website: 'https://www.sac.or.kr',
    address: '서울특별시 서초구 남부순환로 2406',
    phone: '02-580-1300',
    relationshipType: '전시 협력',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'national-museum',
    name: '국립중앙박물관',
    nameEn: 'National Museum of Korea',
    nameCn: '国立中央博物馆',
    nameJp: '国立中央博物館',
    category: 'museum' as const,
    description:
      '대한민국 최대의 박물관으로 서화 컬렉션을 통해 한국 서예의 역사를 조명하고 있습니다.',
    website: 'https://www.museum.go.kr',
    address: '서울특별시 용산구 서빙고로 137',
    phone: '02-2077-9000',
    relationshipType: '소장품 연구 협력',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'hanja-research',
    name: '사단법인 대한민국한자교육연구회',
    nameEn: 'Korea Hanja Education Research Association',
    category: 'partner' as const,
    description:
      '한자 교육과 한자 능력 검정을 전문으로 하는 단체로, 서예 교육과 한자 학습의 접점에서 긴밀한 협력 관계를 유지하고 있습니다.',
    website: 'https://www.hanja.ne.kr',
    address: '서울특별시 종로구',
    relationshipType: '교육 파트너',
    sortOrder: 6,
    isActive: true,
  },
  {
    id: 'eimbook',
    name: '이아임디자인 | 이아임북',
    nameEn: 'EIM Design | EIM Book',
    category: 'publication' as const,
    description:
      '서예 관련 도서 출판 및 디자인 전문 업체로, 전시 도록, 작품집, 홍보물 제작을 담당합니다.',
    website: 'http://eimbook.com/',
    relationshipType: '출판 파트너',
    sortOrder: 7,
    isActive: true,
  },
]

export async function seedPartners() {
  console.log('🌱 Seeding partners...')

  for (const partner of partnerData) {
    await db
      .insert(partners)
      .values(partner)
      .onConflictDoUpdate({
        target: partners.id,
        set: {
          name: partner.name,
          nameEn: partner.nameEn,
          category: partner.category,
          description: partner.description,
          website: partner.website,
          address: partner.address,
          phone: partner.phone,
          relationshipType: partner.relationshipType,
          sortOrder: partner.sortOrder,
          isActive: partner.isActive,
        },
      })
  }

  console.log(`✅ ${partnerData.length} partners seeded`)
}

import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { AboutChapter, AboutHero, AboutPage } from '@/components/about/about-layout'
import { AboutMotion } from '@/components/about/about-motion'
import { AboutNav } from '@/components/about/about-nav'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'

export const metadata: Metadata = {
  title: '임원 조직도 | 동양서예협회',
  description:
    '사단법인 동양서예협회의 임원 조직도를 소개합니다. 고문, 이사장, 감사, 상임이사, 심사위원장, 지부장 등 현재 임원진 구성을 확인하실 수 있습니다.',
  openGraph: {
    title: '임원 조직도 | 동양서예협회',
    description: '사단법인 동양서예협회의 임원 조직도와 현재 임원진을 소개합니다.',
  },
}

type BoardMember = {
  name: string
  /** 큰 글자로 보이는 호 — 한자로 쓴다(2026-11-01). 한자가 없는 순우리말 호는 한글 그대로 */
  artName?: string
  /** 호의 한글 읽기 — 화면 읽기 프로그램용. 한자를 글자마다 읽지 않게 한다. artName 이 한글이면 생략 */
  artNameReading?: string
  position: string
}

type BoardSection = {
  id: string
  title: string
  members: BoardMember[]
}

// 작고하신 분은 임원 조직도에 싣지 않는다 (명예이사장 성곡 임현기, 2026-08 별세)
// 호 한자는 artists.art_name_hanja 에서 옮겼다(2026-11-01, 모두 CJK 호환문자 아님 확인).
// 이사장 宇晨 은 DB 에 없어 요청 값을, 윤경희 '한솔' 은 순우리말이라 한글 그대로 둔다
// (DB 에는 松園 으로 들어 있다 — 페이지 표기 한솔이 맞다고 2026-11-01 확인).
const boardSections: BoardSection[] = [
  {
    id: 'senior-advisor',
    title: '고문',
    members: [
      { name: '강대희', artName: '土偶', artNameReading: '토우', position: '고문' },
      { name: '박영순', artName: '知庸', artNameReading: '지용', position: '고문' },
      { name: '황재국', artName: '中觀', artNameReading: '중관', position: '고문' },
      { name: '임국환', artName: '虎岩', artNameReading: '호암', position: '상임고문' },
    ],
  },
  {
    id: 'chairperson',
    title: '이사장 | 운영위원장',
    members: [{ name: '임재홍', artName: '宇晨', artNameReading: '우신', position: '이사장' }],
  },
  {
    id: 'panel-chair',
    title: '심사위원장',
    members: [{ name: '배옥영', artName: '芽南', artNameReading: '아남', position: '심사위원장' }],
  },
  {
    id: 'auditor',
    title: '감사',
    members: [
      { name: '이권재', artName: '文園', artNameReading: '문원', position: '감사' },
      { name: '박성호', artName: '玉彩', artNameReading: '옥채', position: '감사' },
    ],
  },
  {
    id: 'executive-director',
    title: '상임이사',
    members: [
      { name: '김정례', artName: '惠田', artNameReading: '혜전', position: '상임이사' },
      { name: '소정아', artName: '珍湖', artNameReading: '진호', position: '상임이사' },
      { name: '김형석', artName: '井巖', artNameReading: '정암', position: '상임이사' },
      { name: '최은주', artName: '恩惠', artNameReading: '은혜', position: '상임이사' },
      { name: '공경순', artName: '熙勆', artNameReading: '희랑', position: '상임이사' },
      { name: '민경배', artName: '香村', artNameReading: '향촌', position: '상임이사' },
    ],
  },
  {
    id: 'branch-director',
    title: '지부장',
    members: [
      // 2026-11-01 청주 지부장 교체 — 현 지부장 등곡 김진헌(초대작가), 서천 김정희는 전임
      { name: '김진헌', artName: '登谷', artNameReading: '등곡', position: '청주 지부장' },
      { name: '윤경희', artName: '한솔', position: '태안 지부장' },
      { name: '소정아', artName: '珍湖', artNameReading: '진호', position: '춘천 지부장' },
    ],
  },
]

// 겸직자(소정아)는 두 번 적히므로 사람 수는 이름으로 중복을 걷는다
const BOARD_PERSON_COUNT = new Set(
  boardSections.flatMap(section => section.members.map(member => member.name))
).size

function Person({ member }: { member: BoardMember }) {
  return (
    <li className='ab-person' data-reveal>
      <span className='ab-person__art' aria-hidden='true'>
        {member.artName}
      </span>
      <p className='ab-person__name'>
        {member.name}
        {member.artName && (
          <span className='sr-only'> (호 {member.artNameReading ?? member.artName})</span>
        )}
      </p>
      <p className='ab-person__role'>{member.position}</p>
    </li>
  )
}

export default function BoardMembersPage() {
  return (
    <>
      <AboutPage>
        <AboutHero
          tc={PAGE_HERO_MARKS.boardMembers.tc}
          title='임원'
          lede='현재 사단법인 동양서예협회의 조직도와 임원진을 소개합니다. 궁금하신 부분이 있거나 저희 협회에 남기실 말씀이 있다면 문의하여 주시기 바랍니다.'
          facts={[
            { label: '직책군', value: `${boardSections.length}개` },
            { label: '임원진', value: `${BOARD_PERSON_COUNT}명` },
          ]}
        />
        <AboutNav />
        <AboutChapter
          id='board'
          tone='navy'
          tc='組織'
          eyebrow='The Board'
          title='임원진'
          note='큰 글자는 호(號)입니다.'
        >
          {boardSections.map(section => (
            <section
              key={section.id}
              id={section.id}
              className='ab-roster'
              aria-labelledby={`${section.id}-title`}
            >
              <div className='ab-roster__head'>
                <h3 id={`${section.id}-title`} className='ab-roster__title'>
                  {section.title}
                </h3>
                <span className='ab-roster__count'>{section.members.length}명</span>
              </div>
              <ul className='ab-roster__list'>
                {section.members.map(member => (
                  <Person key={`${section.id}-${member.name}`} member={member} />
                ))}
              </ul>
            </section>
          ))}
        </AboutChapter>
        <AboutMotion />
      </AboutPage>
      <LayoutFooter />
    </>
  )
}

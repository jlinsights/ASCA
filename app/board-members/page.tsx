import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { AboutChapter, AboutHero, AboutPage } from '@/components/about/about-layout'
import { AboutMotion } from '@/components/about/about-motion'
import { AboutNav } from '@/components/about/about-nav'

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
  artName?: string
  position: string
}

type BoardSection = {
  id: string
  title: string
  members: BoardMember[]
}

// 작고하신 분은 임원 조직도에 싣지 않는다 (명예이사장 성곡 임현기, 2026-08 별세)
const boardSections: BoardSection[] = [
  {
    id: 'senior-advisor',
    title: '고문',
    members: [
      { name: '강대희', artName: '토우', position: '고문' },
      { name: '박영순', artName: '지용', position: '고문' },
      { name: '황재국', artName: '중관', position: '고문' },
      { name: '임국환', artName: '호암', position: '상임고문' },
    ],
  },
  {
    id: 'chairperson',
    title: '이사장 | 운영위원장',
    members: [
      {
        name: '임재홍',
        position: '이사장',
      },
    ],
  },
  {
    id: 'panel-chair',
    title: '심사위원장',
    members: [
      {
        name: '배옥영',
        artName: '아남',
        position: '심사위원장',
      },
    ],
  },
  {
    id: 'auditor',
    title: '감사',
    members: [
      { name: '이권재', artName: '문원', position: '감사' },
      { name: '박성호', artName: '옥채', position: '감사' },
    ],
  },
  {
    id: 'executive-director',
    title: '상임이사',
    members: [
      { name: '김정례', artName: '혜전', position: '상임이사' },
      { name: '소정아', artName: '진호', position: '상임이사' },
      { name: '김형석', artName: '정암', position: '상임이사' },
      { name: '최은주', artName: '은혜', position: '상임이사' },
      { name: '공경순', artName: '희랑', position: '상임이사' },
      { name: '민경배', artName: '향촌', position: '상임이사' },
    ],
  },
  {
    id: 'branch-director',
    title: '지부장',
    members: [
      { name: '김정희', artName: '서천', position: '청주 지부장' },
      { name: '윤경희', artName: '한솔', position: '태안 지부장' },
      { name: '소정아', artName: '진호', position: '춘천 지부장' },
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
        {member.artName && <span className='sr-only'> (호 {member.artName})</span>}
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
          tc='任員'
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

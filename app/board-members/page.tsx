import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Crown, Shield, Briefcase, Gavel, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: '임원 조직도 | 동양서예협회',
  description:
    '사단법인 동양서예협회의 임원 조직도를 소개합니다. 명예이사장, 고문, 이사장, 감사, 상임이사, 심사위원장, 지부장 등 현재 임원진 구성을 확인하실 수 있습니다.',
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
  icon: typeof Users
  members: BoardMember[]
}

const boardSections: BoardSection[] = [
  {
    id: 'chairman-emeritus',
    title: '명예이사장',
    icon: Crown,
    members: [
      {
        name: '임현기',
        artName: '성곡',
        position: '명예이사장',
      },
    ],
  },
  {
    id: 'senior-advisor',
    title: '고문',
    icon: Shield,
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
    icon: Briefcase,
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
    icon: Gavel,
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
    icon: Shield,
    members: [
      { name: '배옥영', artName: '아남', position: '감사' },
      { name: '이권재', artName: '문원', position: '감사' },
      { name: '박성호', artName: '옥채', position: '감사' },
    ],
  },
  {
    id: 'executive-director',
    title: '상임이사',
    icon: Users,
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
    icon: MapPin,
    members: [
      { name: '김정희', artName: '서천', position: '청주 지부장' },
      { name: '윤경희', artName: '한솔', position: '태안 지부장' },
      { name: '소정아', artName: '진호', position: '춘천 지부장' },
    ],
  },
]

function MemberCard({ member }: { member: BoardMember }) {
  return (
    <Card className='transition-shadow hover:shadow-md'>
      <CardContent className='p-4 text-center'>
        <div className='w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center'>
          <span className='text-lg font-bold text-muted-foreground'>{member.name.charAt(0)}</span>
        </div>
        {member.artName && <p className='text-xs text-muted-foreground mb-0.5'>{member.artName}</p>}
        <h3 className='text-sm font-semibold'>{member.name}</h3>
        <Badge variant='secondary' className='mt-2 text-xs'>
          {member.position}
        </Badge>
      </CardContent>
    </Card>
  )
}

export default function BoardMembersPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            Board Members
          </p>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>임 원</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            현재 사단법인 동양서예협회의 조직도와 임원진을 소개합니다. 궁금하신 부분이 있거나 저희
            협회에 남기실 말씀이 있다면 문의하여 주시기 바랍니다.
          </p>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='max-w-5xl mx-auto space-y-12'>
          {boardSections.map(section => {
            const Icon = section.icon
            return (
              <div key={section.id} id={section.id}>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-10 h-10 rounded-lg bg-scholar-red/10 flex items-center justify-center'>
                    <Icon className='w-5 h-5 text-scholar-red' />
                  </div>
                  <h2 className='text-xl font-bold'>{section.title}</h2>
                </div>

                <div
                  className={`grid gap-4 ${
                    section.members.length === 1
                      ? 'grid-cols-1 max-w-xs mx-auto'
                      : section.members.length === 2
                        ? 'grid-cols-1 sm:grid-cols-2 max-w-lg mx-auto'
                        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                  }`}
                >
                  {section.members.map((member, idx) => (
                    <MemberCard key={`${section.id}-${idx}`} member={member} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}

// 개발용 관리자 계정 생성 스크립트
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // 서비스 키 필요

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL과 Service Key가 필요합니다.')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '설정됨' : '없음')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '설정됨' : '없음')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const adminUsers = [
  {
    email: 'admin@asca.kr',
    password: 'admin123!@#',
    name: '시스템 관리자',
    role: 'super_admin',
  },
  {
    email: 'content@asca.kr',
    password: 'content123!@#',
    name: '콘텐츠 관리자',
    role: 'content_manager',
  },
  {
    email: 'editor@asca.kr',
    password: 'editor123!@#',
    name: '편집자',
    role: 'editor',
  },
]

async function createAdminUsers() {
  console.log('관리자 계정 생성 시작...')

  for (const user of adminUsers) {
    try {
      console.log(`\n${user.email} 계정 생성 중...`)

      // 1. Auth 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })

      if (authError) {
        console.error(`❌ ${user.email} Auth 계정 생성 실패:`, authError.message)
        continue
      }

      console.log(`✅ ${user.email} Auth 계정 생성 완료`)

      // 2. 역할 ID 조회
      const { data: roleData, error: roleError } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('name', user.role)
        .single()

      if (roleError) {
        console.error(`❌ 역할 조회 실패 (${user.role}):`, roleError.message)
        continue
      }

      // 3. admin_users 테이블에 추가
      const { error: adminError } = await supabase.from('admin_users').upsert({
        user_id: authData.user.id,
        role_id: roleData.id,
        name: user.name,
        email: user.email,
        is_active: true,
      })

      if (adminError) {
        console.error(`❌ 관리자 정보 저장 실패 (${user.email}):`, adminError.message)
        continue
      }

      console.log(`✅ ${user.email} 관리자 정보 저장 완료`)
    } catch (error) {
      console.error(`❌ ${user.email} 처리 중 오류:`, error.message)
    }
  }

  console.log('\n🎉 관리자 계정 생성 완료!')
  console.log('\n📋 생성된 계정 정보:')
  adminUsers.forEach(user => {
    console.log(`- ${user.email} / ${user.password} (${user.name})`)
  })
}

createAdminUsers().catch(console.error)

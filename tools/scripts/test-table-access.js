const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testTableAccess() {
  console.log('🔍 Testing table access with different keys...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Environment variables:')
  console.log('SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.log('SERVICE_ROLE_KEY:', serviceRoleKey ? '✅' : '❌')
  console.log('ANON_KEY:', anonKey ? '✅' : '❌')
  console.log('')

  // 1. Service Role Key로 테스트
  console.log('🔐 Testing with Service Role Key...')
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    const { data, error } = await serviceClient
      .from('artists')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.log('❌ Service Role Error:', error.code, error.message)
    } else {
      console.log('✅ Service Role: Table accessible')
    }
  } catch (err) {
    console.log('❌ Service Role Exception:', err.message)
  }

  // 2. Anon Key로 테스트
  console.log('\n🌐 Testing with Anon Key...')
  const anonClient = createClient(supabaseUrl, anonKey)

  try {
    const { data, error } = await anonClient
      .from('artists')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.log('❌ Anon Key Error:', error.code, error.message)

      if (error.code === '42P01') {
        console.log('\n💡 Anon Key cannot see the table!')
        console.log('This means RLS policies might be too restrictive or table is in wrong schema.')
      }
    } else {
      console.log('✅ Anon Key: Table accessible')
    }
  } catch (err) {
    console.log('❌ Anon Key Exception:', err.message)
  }

  // 3. 테이블 스키마 확인 (Service Role)
  console.log('\n📋 Checking table schema...')
  try {
    const { data, error } = await serviceClient
      .from('information_schema.tables')
      .select('table_schema, table_name')
      .eq('table_name', 'artists')

    if (error) {
      console.log('❌ Schema check error:', error.message)
    } else if (data && data.length > 0) {
      console.log('✅ Table found in schema:', data[0].table_schema)
    } else {
      console.log('❌ Table not found in any schema')
    }
  } catch (err) {
    console.log('❌ Schema check exception:', err.message)
  }

  // 4. 직접 SQL로 테이블 확인
  console.log('\n🔎 Direct SQL check...')
  try {
    const { data, error } = await serviceClient.rpc('exec_sql', {
      sql: `SELECT schemaname, tablename FROM pg_tables WHERE tablename = 'artists';`,
    })

    if (error) {
      console.log('⚠️ exec_sql not available, skipping direct SQL check')
    } else {
      console.log('✅ Direct SQL result:', data)
    }
  } catch (err) {
    console.log('⚠️ Direct SQL check failed:', err.message)
  }
}

testTableAccess()

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createTables() {
  console.log('🚀 Starting table creation...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing environment variables');
    console.log('SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.log('SERVICE_ROLE_KEY:', serviceRoleKey ? '✅' : '❌');
    return;
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  // Artists 테이블 생성 SQL
  const createArtistsTable = `
    CREATE TABLE IF NOT EXISTS public.artists (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      name_en TEXT,
      name_ja TEXT,
      name_zh TEXT,
      bio TEXT DEFAULT '',
      bio_en TEXT,
      bio_ja TEXT,
      bio_zh TEXT,
      birth_year INTEGER,
      nationality TEXT,
      specialties TEXT[] DEFAULT '{}',
      awards TEXT[] DEFAULT '{}',
      exhibitions TEXT[] DEFAULT '{}',
      profile_image TEXT,
      membership_type TEXT DEFAULT '준회원',
      artist_type TEXT DEFAULT '일반작가',
      title TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  
  // RLS 정책 생성
  const enableRLS = `ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;`;
  
  const createPolicies = `
    CREATE POLICY IF NOT EXISTS "작가 정보 읽기 허용" ON public.artists FOR SELECT USING (true);
    CREATE POLICY IF NOT EXISTS "작가 정보 추가 허용" ON public.artists FOR INSERT WITH CHECK (true);
    CREATE POLICY IF NOT EXISTS "작가 정보 수정 허용" ON public.artists FOR UPDATE USING (true);
    CREATE POLICY IF NOT EXISTS "작가 정보 삭제 허용" ON public.artists FOR DELETE USING (true);
  `;
  
  try {
    console.log('📝 Creating artists table...');
    const { data: tableResult, error: tableError } = await supabase.rpc('exec_sql', {
      sql: createArtistsTable
    });
    
    if (tableError) {
      console.log('⚠️ exec_sql not available, trying direct query...');
      
      // 직접 쿼리 시도
      const { data, error } = await supabase
        .from('artists')
        .select('count', { count: 'exact', head: true });
        
      if (error && error.code === '42P01') {
        console.log('❌ Table does not exist and cannot create via API');
        console.log('\n🔗 Please execute this SQL in Supabase Dashboard:');
        console.log('▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼');
        console.log(createArtistsTable);
        console.log('\n-- Enable RLS');
        console.log(enableRLS);
        console.log('\n-- Create policies');
        console.log(createPolicies);
        console.log('▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲');
        console.log('\n📋 Steps:');
        console.log('1. Go to: https://supabase.com/dashboard/project/fiaoduraycyjselasmdn/sql/new');
        console.log('2. Copy and paste the SQL above');
        console.log('3. Click "RUN" button');
        console.log('4. Run this script again to verify');
        return;
      } else if (!error) {
        console.log('✅ Table already exists!');
        return;
      }
    } else {
      console.log('✅ Table created successfully');
    }
    
    console.log('🔐 Setting up RLS...');
    await supabase.rpc('exec_sql', { sql: enableRLS });
    await supabase.rpc('exec_sql', { sql: createPolicies });
    
    console.log('✅ All done! Testing table...');
    
    // 테이블 테스트
    const { data: testData, error: testError } = await supabase
      .from('artists')
      .select('count', { count: 'exact', head: true });
      
    if (testError) {
      console.error('❌ Test failed:', testError);
    } else {
      console.log('✅ Table is working! Current row count:', testData?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTables(); 
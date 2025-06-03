require('dotenv').config({ path: '.env.local' });

console.log('🔍 Environment Variables Check:');
console.log('================================');

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ ' + process.env.NEXT_PUBLIC_SUPABASE_URL : '❌ Not set');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : '❌ Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ ' + process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : '❌ Not set');
console.log('AIRTABLE_API_KEY:', process.env.AIRTABLE_API_KEY ? '✅ ' + process.env.AIRTABLE_API_KEY.substring(0, 20) + '...' : '❌ Not set');
console.log('AIRTABLE_BASE_ID:', process.env.AIRTABLE_BASE_ID ? '✅ ' + process.env.AIRTABLE_BASE_ID : '❌ Not set');

console.log('\n🧪 Testing Supabase Connections:');
console.log('===============================');

const { createClient } = require('@supabase/supabase-js');

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Test connection
  supabaseAdmin
    .from('artists')
    .select('count', { count: 'exact', head: true })
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Service Role Error:', error.code, error.message);
      } else {
        console.log('✅ Service Role: Connected successfully');
      }
    })
    .catch(err => {
      console.log('❌ Service Role Exception:', err.message);
    });
} else {
  console.log('❌ Cannot test Service Role - missing environment variables');
} 
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testCreateArtist() {
  console.log('🧪 Testing direct artist creation...\n')

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.log('❌ Missing environment variables')
      return
    }

    console.log('1. Creating Supabase Admin client...')
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    console.log('✅ Supabase Admin client created')

    console.log('\n2. Testing artists table access...')
    const { data: testQuery, error: testError } = await supabase
      .from('artists')
      .select('count', { count: 'exact', head: true })

    if (testError) {
      console.log('❌ Test query failed:', JSON.stringify(testError, null, 2))
      return
    } else {
      console.log('✅ Test query successful')
    }

    console.log('\n3. Creating test artist...')
    const testArtistData = {
      name: 'Test Artist 테스트',
      bio: 'Test bio',
      membership_type: '준회원',
      artist_type: '일반작가',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log('Test data:', JSON.stringify(testArtistData, null, 2))

    const { data: createResult, error: createError } = await supabase
      .from('artists')
      .insert([testArtistData])
      .select()
      .single()

    if (createError) {
      console.log('❌ Create failed - Full error object:')
      console.log(JSON.stringify(createError, null, 2))
      console.log('❌ Create failed - Error toString:', createError.toString())
      console.log('❌ Create failed - Error keys:', Object.keys(createError))
    } else {
      console.log('✅ Artist created successfully!')
      console.log('Created artist:', {
        id: createResult.id,
        name: createResult.name,
      })

      // Clean up - delete the test artist
      console.log('\n4. Cleaning up...')
      const { error: deleteError } = await supabase
        .from('artists')
        .delete()
        .eq('id', createResult.id)

      if (deleteError) {
        console.log('⚠️ Cleanup failed:', deleteError.message)
      } else {
        console.log('✅ Test artist deleted')
      }
    }
  } catch (error) {
    console.error('❌ Test failed with exception:', error)
  }
}

testCreateArtist()

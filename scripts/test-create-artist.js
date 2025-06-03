require('dotenv').config({ path: '.env.local' });

async function testCreateArtist() {
  console.log('🧪 Testing createArtist function...\n');

  try {
    // Import after env vars are loaded
    const { ensureSupabaseAdmin } = require('../lib/supabase');
    
    console.log('1. Testing Supabase Admin connection...');
    const supabase = ensureSupabaseAdmin();
    console.log('✅ Supabase Admin client created');

    console.log('\n2. Testing artists table query...');
    const { data: testQuery, error: testError } = await supabase
      .from('artists')
      .select('count', { count: 'exact', head: true });

    if (testError) {
      console.log('❌ Test query failed:', testError);
      return;
    } else {
      console.log('✅ Test query successful');
    }

    console.log('\n3. Creating test artist...');
    const testArtistData = {
      name: 'Test Artist 테스트',
      bio: 'Test bio',
      membership_type: '준회원',
      artist_type: '일반작가'
    };

    console.log('Test data:', JSON.stringify(testArtistData, null, 2));

    const { data: createResult, error: createError } = await supabase
      .from('artists')
      .insert([{
        ...testArtistData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      console.log('❌ Create failed:', {
        code: createError.code,
        message: createError.message,
        details: createError.details,
        hint: createError.hint
      });
    } else {
      console.log('✅ Artist created successfully!');
      console.log('Created artist:', {
        id: createResult.id,
        name: createResult.name
      });

      // Clean up - delete the test artist
      console.log('\n4. Cleaning up...');
      const { error: deleteError } = await supabase
        .from('artists')
        .delete()
        .eq('id', createResult.id);

      if (deleteError) {
        console.log('⚠️ Cleanup failed:', deleteError.message);
      } else {
        console.log('✅ Test artist deleted');
      }
    }

  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }
}

testCreateArtist(); 
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')

// 이미지를 Airtable에서 다운로드해서 Supabase Storage로 업로드하는 함수
async function migrateImageToSupabaseStorage(airtableImageUrl, artistName) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )

  try {
    console.log('📥 Downloading image from Airtable:', airtableImageUrl)

    // 1. Airtable에서 이미지 다운로드
    const response = await fetch(airtableImageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }

    const imageBuffer = await response.buffer()
    const contentType = response.headers.get('content-type')

    // 2. 파일명 생성 (안전한 형태로)
    const fileExtension =
      contentType === 'image/jpeg' ? 'jpg' : contentType === 'image/png' ? 'png' : 'jpg'
    const safeArtistName = artistName.replace(/[^a-zA-Z0-9가-힣]/g, '_')
    const fileName = `${safeArtistName}_${Date.now()}.${fileExtension}`
    const filePath = `artists/${fileName}`

    // 3. Supabase Storage에 업로드
    console.log('📤 Uploading to Supabase Storage:', filePath)
    const { data, error } = await supabase.storage.from('images').upload(filePath, imageBuffer, {
      contentType: contentType,
      upsert: false,
    })

    if (error) {
      throw error
    }

    // 4. 공개 URL 생성
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath)

    console.log('✅ Image migrated successfully:', urlData.publicUrl)

    return {
      success: true,
      originalUrl: airtableImageUrl,
      supabaseUrl: urlData.publicUrl,
      filePath: filePath,
    }
  } catch (error) {
    console.error('❌ Image migration failed:', error)
    return {
      success: false,
      error: error.message,
      originalUrl: airtableImageUrl,
    }
  }
}

// 개선된 작가 데이터 변환 함수
async function transformArtistWithImageMigration(record) {
  const fields = record.fields

  let profileImageUrl = null

  // 프로필 이미지가 있으면 Supabase Storage로 마이그레이션
  if (fields['Profile Image'] && fields['Profile Image'][0]) {
    const imageResult = await migrateImageToSupabaseStorage(
      fields['Profile Image'][0].url,
      fields['Name (Korean)'] || 'unknown'
    )

    if (imageResult.success) {
      profileImageUrl = imageResult.supabaseUrl
    } else {
      // 실패 시 원본 URL 사용
      profileImageUrl = fields['Profile Image'][0].url
    }
  }

  return {
    name: fields['Name (Korean)'] || '',
    name_en: fields['Name (English)'] || null,
    name_ja: fields['Name (Japanese)'] || null,
    name_zh: fields['Name (Chinese)'] || null,
    bio: fields['Bio (Korean)'] || '',
    bio_en: fields['Bio (English)'] || null,
    bio_ja: fields['Bio (Japanese)'] || null,
    bio_zh: fields['Bio (Chinese)'] || null,
    birth_year: fields['Birth Year'] || null,
    nationality: fields['Nationality'] || null,
    specialties: fields['Specialties'] || [],
    awards: fields['Awards'] || [],
    exhibitions: fields['Exhibitions'] || [],
    profile_image: profileImageUrl,
    membership_type: fields['Membership Type'] || '준회원',
    artist_type: fields['Artist Type'] || '일반작가',
    title: fields['Title'] || null,
  }
}

console.log('📋 Advanced Image Migration Strategy:')
console.log('=====================================')
console.log('✅ Current: Store Airtable URL directly')
console.log('🚀 Advanced: Download → Upload to Supabase Storage')
console.log('')
console.log('Benefits of advanced approach:')
console.log('- 🏠 Images hosted on your Supabase')
console.log('- 🚀 Better performance')
console.log('- 🔒 Better security control')
console.log('- 📱 CDN optimization')
console.log('- 🛡️ No external dependency')

module.exports = {
  migrateImageToSupabaseStorage,
  transformArtistWithImageMigration,
}

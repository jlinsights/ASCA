require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

async function checkProfileImages() {
  console.log('🖼️ Checking Airtable Profile Image structure...\n');
  
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
  }).base(process.env.AIRTABLE_BASE_ID);

  try {
    const records = await base('Artists').select({
      maxRecords: 3,
      filterByFormula: 'NOT({Profile Image} = BLANK())'
    }).firstPage();

    if (records && records.length > 0) {
      records.forEach((record, index) => {
        console.log(`📸 Artist ${index + 1}: ${record.fields['Name (Korean)']}`);
        console.log('Profile Image data:');
        console.log(JSON.stringify(record.fields['Profile Image'], null, 2));
        
        if (record.fields['Profile Image'] && record.fields['Profile Image'][0]) {
          console.log('✅ First image URL:', record.fields['Profile Image'][0].url);
        }
        console.log('---');
      });
      
      console.log('\n📋 Summary:');
      console.log('- Airtable stores images as array of objects');
      console.log('- Each image object has: id, url, filename, size, type');
      console.log('- Migration takes first image URL: fields["Profile Image"][0].url');
      console.log('- This URL is stored as TEXT in Supabase profile_image field');
      
    } else {
      console.log('❌ No records with profile images found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProfileImages(); 
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const urls = [
  'https://orientalcalligraphy.org/post/curriculum-guiance-for-traditional-calligraphy',
  'https://orientalcalligraphy.org/post/calligraphy-the-art-of-writing-the-future-beyond-crisis-a-survival-strategy-of-convergence-and-expansion',
  'https://orientalcalligraphy.org/post/checklist-for-successful-exhibition',
  'https://orientalcalligraphy.org/post/gyeomjae-jeongseon',
  'https://orientalcalligraphy.org/post/a-journey-through-east-asian-calligraphy-exploring-hanja-hangul-and-kana-scripts',
  'https://orientalcalligraphy.org/post/dongyangseoyehyeobhoe-hoebi-mic-gwanryeon-jeongcaeg-bunseoggwa-gaeseon-bangan-jean-bogoseo',
  'https://orientalcalligraphy.org/post/gugje-seoye-jeonsiyi-hyeogsin-jagpum-jeongbo-jegongyi-jungyoseonggwa-simsa-siseutem-gaeseon',
  'https://orientalcalligraphy.org/post/calligraphy-association-suggestions',
  'https://orientalcalligraphy.org/post/hundred-schools-of-thought-ancient-chinese-philosophy-modern-wisdom',
  'https://orientalcalligraphy.org/post/history-and-influence-of-hanja-in-korean-language',
  'https://orientalcalligraphy.org/post/traditional-calligraphy-digital-age-new-cultural-value',
  'https://orientalcalligraphy.org/post/oriental-calligraphy-association-history-and-influence-on-korean-calligraphy',
  'https://orientalcalligraphy.org/post/seongok-lim-hyunki-life-and-influence-on-korean-calligraphy'
];

async function scrapePost(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    // Selectors customized for the target site (need to adjust based on inspection)
    const title = $('h1').first().text().trim() || 'Untitled Post';
    
    // Try to find date
    let dateStr = new Date().toISOString(); // Default
    try {
        const potentialDate = $('div, span, p').filter((i, el) => {
            const txt = $(el).text().trim();
            return /^[A-Za-z]+ \d{1,2}, \d{4}$/.test(txt); // Matches "December 14, 2025" strict
        }).first().text().trim();
        
        if (potentialDate) {
           dateStr = new Date(potentialDate).toISOString();
        }
    } catch (e) {
        console.log('Date parse failed, using now');
    }

    const content = $('.rich-text-block').html() || $('article').html() || $('main').html() || 'No Content Found'; 
    
    // Clean content a bit (optional, convert to text or keep HTML?)
    // Converting to text for summary
    const textContent = $(content).text().replace(/\s+/g, ' ').substring(0, 200) + '...';
    
    // Image
    const image = $('img').first().attr('src') || '';
    
    return {
      id: url.split('/').pop(),
      title,
      summary: textContent,
      content: content, 
      publishedAt: dateStr,
      source: 'local', 
      link: url, // Keep original link for reference? Or make a local link?
       // Local link logic: /blog/id
      localLink: `/blog/${url.split('/').pop()}`,
      thumbnail: image,
      author: 'ASCA',
      tags: ['Migration']
    };
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error.message);
    // Return a placeholder instead of null so we don't lose the item entirely
    return {
        id: url.split('/').pop(),
        title: 'Failed to Scrape',
        summary: 'Error: ' + error.message,
        content: '',
        publishedAt: new Date().toISOString(),
        source: 'local',
        link: url,
        thumbnail: '',
        author: 'System',
        tags: ['Error']
    };
  }
}

async function main() {
  const posts = [];
  for (const url of urls) {
    console.log(`Scraping ${url}...`);
    const post = await scrapePost(url);
    if (post) posts.push(post);
    // Be nice to the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  fs.writeFileSync('migrated_posts.json', JSON.stringify(posts, null, 2));
  console.log('Done! Saved to migrated_posts.json');
}

main();

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read blog-posts.json
const blogPostsPath = path.join(__dirname, '../lib/data/blog-posts.json');
const blogPosts = JSON.parse(fs.readFileSync(blogPostsPath, 'utf-8'));

console.log(`🎨 Applying generated thumbnails to blog posts...`);

// Mapping of post IDs to generated thumbnail filenames
const thumbnailMapping = {
  'calligraphy-the-art-of-writing-the-future-beyond-crisis-a-survival-strategy-of-convergence-and-expansion': 'blog_future_calligraphy_1766837271486.png',
  'checklist-for-successful-exhibition': 'blog_exhibition_checklist_1766837286479.png',
  // Post ID 3 (회비 정책) - will use policy image
  'gyeomjae-jeongseon': null, // Already has image
  'a-journey-through-east-asian-calligraphy-exploring-hanja-hangul-and-kana-scripts': null, // Already has image
  'blog-association-naming': 'blog_association_naming_1766837325112.png',
  'blog-hundred-schools': 'blog_hundred_schools_1766837343143.png',
  'blog-hanja-significance': 'blog_hanja_significance_1766837361774.png',
  'blog-digital-tradition': 'blog_digital_tradition_1766837378598.png',
  'blog-association-history': 'blog_association_history_1766837397479.png',
  'blog-artist-journey': 'blog_artist_journey_1766837415736.png'
};

// Manual mapping by title keywords
const updatedPosts = blogPosts.map((post) => {
  const title = post.title.toLowerCase();
  const id = post.id;
  
  let newThumbnail = null;
  
  // Map by keywords in title
  if (title.includes('위기를 넘어') || title.includes('미래를 쓰는')) {
    newThumbnail = '/images/blog-thumbnails/blog_future_calligraphy_1766837271486.png';
  } else if (title.includes('체크리스트') || title.includes('전시 개최')) {
    newThumbnail = '/images/blog-thumbnails/blog_exhibition_checklist_1766837286479.png';
  } else if (title.includes('회비') || title.includes('정책')) {
    newThumbnail = '/images/blog-thumbnails/blog_association_policy_1766837306117.png';
  } else if (title.includes('국제') || title.includes('전시의 혁신')) {
    // International exhibition - need to retry or use policy
    newThumbnail = '/images/blog-thumbnails/blog_association_policy_1766837306117.png'; // Fallback
  } else if (title.includes('명칭') || title.includes('협회')) {
    newThumbnail = '/images/blog-thumbnails/blog_association_naming_1766837325112.png';
  } else if (title.includes('제자백가') || title.includes('철학')) {
    newThumbnail = '/images/blog-thumbnails/blog_hundred_schools_1766837343143.png';
  } else if (title.includes('한자:') || title.includes('역사적 뿌리')) {
    newThumbnail = '/images/blog-thumbnails/blog_hanja_significance_1766837361774.png';
  } else if (title.includes('디지털') || title.includes('새로운 문화')) {
    newThumbnail = '/images/blog-thumbnails/blog_digital_tradition_1766837378598.png';
  } else if (title.includes('역사와') || title.includes('한국서단')) {
    newThumbnail = '/images/blog-thumbnails/blog_association_history_1766837397479.png';
  } else if (title.includes('임현기') || title.includes('예술 여정')) {
    newThumbnail = '/images/blog-thumbnails/blog_artist_journey_1766837415736.png';
  }
  
  if (newThumbnail && post.thumbnail.includes('Logo%20%26%20Tagline')) {
    console.log(`✅ Updated: ${post.title.substring(0, 50)}...`);
    console.log(`   New: ${newThumbnail}`);
    return { ...post, thumbnail: newThumbnail };
  }
  
  return post;
});

// Write back
fs.writeFileSync(blogPostsPath, JSON.stringify(updatedPosts, null, 2), 'utf-8');

console.log('\n✨ Thumbnail update complete!');

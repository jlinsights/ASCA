#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read blog-posts.json
const blogPostsPath = path.join(__dirname, '../lib/data/blog-posts.json');
const blogPosts = JSON.parse(fs.readFileSync(blogPostsPath, 'utf-8'));

console.log(`📚 Processing ${blogPosts.length} blog posts...`);

let updatedCount = 0;
const defaultThumbnail = "https://cdn.prod.website-files.com/6220af701a295f35d5c625ff/67bad637100432195863fad7_Logo%20%26%20Tagline_black%20BG.avif";

// Process each post
const updatedPosts = blogPosts.map((post, index) => {
  if (!post.content) {
    console.log(`⚠️  Post ${index + 1} (${post.title}) has no content, skipping...`);
    return post;
  }

  // Extract first image from HTML content
  // Match: <img src="..." or <img ... src="..."
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
  const match = post.content.match(imgRegex);

  if (match && match[1]) {
    const extractedThumbnail = match[1];
    
    // Only update if it's different from current
    if (post.thumbnail !== extractedThumbnail) {
      console.log(`✅ Post ${index + 1}: ${post.title}`);
      console.log(`   Old: ${post.thumbnail?.substring(0, 80)}...`);
      console.log(`   New: ${extractedThumbnail.substring(0, 80)}...`);
      
      post.thumbnail = extractedThumbnail;
      updatedCount++;
    } else {
      console.log(`✓  Post ${index + 1}: ${post.title} - thumbnail already correct`);
    }
  } else {
    console.log(`ℹ️  Post ${index + 1}: ${post.title} - no image found in content, keeping default`);
  }

  return post;
});

// Write updated data back
fs.writeFileSync(blogPostsPath, JSON.stringify(updatedPosts, null, 2), 'utf-8');

console.log('\n========================================');
console.log(`✨ Thumbnail sync complete!`);
console.log(`   Total posts: ${blogPosts.length}`);
console.log(`   Updated: ${updatedCount}`);
console.log(`   Unchanged: ${blogPosts.length - updatedCount}`);
console.log('========================================\n');

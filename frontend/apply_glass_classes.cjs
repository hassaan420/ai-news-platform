const fs = require('fs');

function replaceGlassClasses(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Matches common inline glass styles and replaces them with glass-panel
  content = content.replace(/bg-white\/\[0\.12\] backdrop-blur-xl border border-white\/\[0\.07\]/g, 'glass-2');
  content = content.replace(/bg-white\/\[0\.08\] backdrop-blur-md border border-white\/\[0\.05\]/g, 'glass-1');
  content = content.replace(/bg-white\/\[0\.15\] backdrop-blur-2xl border border-white\/\[0\.1\]/g, 'glass-3');
  
  // also look for bg-card
  // content = content.replace(/bg-card border border-border/g, 'glass-panel'); 
  
  // Specific to ArticleCard
  content = content.replace(/hover:bg-white\/\[0\.07\]/g, 'hover:bg-white/[0.05]');
  content = content.replace(/shadow-2xl hover:shadow-\[0_16px_48px_rgba\(0,0,0,0\.35\)\]/g, 'shadow-premium hover:shadow-premium-hover');

  fs.writeFileSync(filePath, content, 'utf-8');
}

replaceGlassClasses('src/components/ArticleCard.tsx');
replaceGlassClasses('src/components/TrendingCard.tsx');
replaceGlassClasses('src/components/WeatherSportsWidget.tsx');
replaceGlassClasses('src/components/FeaturedCarousel.tsx');

console.log('Glass classes applied.');

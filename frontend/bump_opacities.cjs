const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Opacity bumps for text
  content = content.replace(/text-white\/30/g, 'text-white/70');
  content = content.replace(/text-white\/40/g, 'text-white/80');
  content = content.replace(/text-white\/50/g, 'text-white/90');
  content = content.replace(/text-white\/60/g, 'text-white');
  content = content.replace(/text-white\/70/g, 'text-white');
  
  // Border bumps
  content = content.replace(/border-white\/\[0\.04\]/g, 'border-white/[0.1]');
  content = content.replace(/border-white\/\[0\.06\]/g, 'border-white/[0.15]');
  content = content.replace(/border-white\/\[0\.08\]/g, 'border-white/[0.2]');
  
  // Background bumps for prominence
  content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-white/[0.06]');
  content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-white/[0.08]');
  content = content.replace(/bg-white\/\[0\.04\]/g, 'bg-white/[0.1]');
  content = content.replace(/bg-white\/\[0\.05\]/g, 'bg-white/[0.12]');
  content = content.replace(/bg-white\/\[0\.06\]/g, 'bg-white/[0.15]');
  content = content.replace(/bg-white\/\[0\.08\]/g, 'bg-white/[0.2]');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});

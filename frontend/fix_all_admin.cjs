
const fs = require('fs');
const path = require('path');

const dir = 'src/pages/admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  content = content.replace(/text-white\/90/g, 'text-heading-theme');
  content = content.replace(/text-white\/80/g, 'text-secondary-theme');
  content = content.replace(/text-white\/70/g, 'text-secondary-theme');
  content = content.replace(/text-white\/60/g, 'text-muted-theme');
  content = content.replace(/text-white\/50/g, 'text-muted-theme');
  content = content.replace(/text-white\/35/g, 'text-muted-theme');
  content = content.replace(/text-white/g, 'text-primary-theme');

  content = content.replace(/border-white\/\[0\.05\]/g, 'border-border/30');
  content = content.replace(/border-white\/\[0\.1\]/g, 'border-border/50');
  content = content.replace(/border-white\/\[0\.2\]/g, 'border-border');
  content = content.replace(/border-white\/20/g, 'border-border/50');
  content = content.replace(/border-white\/10/g, 'border-border/30');

  content = content.replace(/bg-white\/\[0\.2\]/g, 'bg-black/5 dark:bg-white/5');
  content = content.replace(/bg-white\/\[0\.1\]/g, 'bg-black/5 dark:bg-white/5');
  content = content.replace(/bg-white\/\[0\.15\]/g, 'bg-black/10 dark:bg-white/10');
  content = content.replace(/bg-white\/10/g, 'bg-black/5 dark:bg-white/5');
  content = content.replace(/bg-white\/20/g, 'bg-black/10 dark:bg-white/10');
  content = content.replace(/bg-white\/5/g, 'bg-black/5 dark:bg-white/5');

  fs.writeFileSync(filePath, content, 'utf-8');
}
console.log('Fixed all admin colors');


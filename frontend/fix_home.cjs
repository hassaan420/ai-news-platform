const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// 1. Update Layout Columns
content = content.replace('className="lg:col-span-8 space-y-12"', 'className="xl:col-span-9 lg:col-span-8 space-y-12"');
content = content.replace('className="hidden lg:block lg:col-span-4 space-y-8 pb-8"', 'className="hidden lg:block xl:col-span-3 lg:col-span-4 sticky top-[104px] h-[calc(100vh-104px)] overflow-y-auto sidebar-scroll space-y-8 pb-8 pr-2"');

// 2. Update Latest Analysis Grid
// Replace ALL occurrences to handle personalized news too
content = content.replaceAll('className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start"');

// 3. Move International Headlines below Latest Analysis
const intl_start = content.indexOf('          {/* International Headlines */}');
const intl_end = content.indexOf('          {/* LATEST ANALYSIS */}');
const intl_block = content.substring(intl_start, intl_end);
const latest_end = content.indexOf('        {/* RIGHT COLUMN: Sidebar */}');

let new_content = content.substring(0, intl_start) + content.substring(intl_end, latest_end) + '\n' + intl_block + '\n' + content.substring(latest_end);

// 4. Remove Infinite Scroll Load More Button
new_content = new_content.replace(/\{latestNews && !latestNews\.last && \([\s\S]*?<\/button>\s*\)\}\s*<\/div>\s*\)\}/, '');

fs.writeFileSync('src/pages/Home.tsx', new_content, 'utf-8');
console.log('Done!');

const fs = require('fs');
const content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// 1. Remove infinite scroll hook
let newContent = content.replace(/\/\/ Infinite scroll observer\s*useEffect\(\(\) => \{[\s\S]*?\}, \[latestNews, status\]\);/m, '');
newContent = newContent.replace('dispatch(fetchLatestNews({ page, size: 12, dateFilter, from, to }));', 'dispatch(fetchLatestNews({ page: 0, size: 14, dateFilter, from, to }));');
newContent = newContent.replace('}, [dispatch, page, dateFilter, from, to]);', '}, [dispatch, dateFilter, from, to]);');

// 2. Remove Load More button from Latest Analysis
newContent = newContent.replace(/\{latestNews && !latestNews\.last && \([\s\S]*?<\/button>\s*\)\}\s*<\/div>\s*\)\}/, '');

// 3. Extract the Right Sidebar
const rightStart = newContent.indexOf('      {/* RIGHT COLUMN: Sidebar (Floated) */}');
const rightEnd = newContent.indexOf('      {/* LEFT COLUMN CONTENT */}');
const rightBlock = newContent.substring(rightStart, rightEnd).trim();

// 4. Clean up the extracted right sidebar (remove float-right, change to flex sizing and sticky)
let cleanRightBlock = rightBlock.replace('className="hidden lg:block float-right w-[33.333%] pl-8 pb-8 relative z-10"', 'className="hidden lg:block w-full lg:w-1/3 sticky top-[104px] space-y-8 pb-8"');

// 5. Extract Featured block
const featuredStart = newContent.indexOf('      <section className="mb-12">');
const featuredEnd = newContent.indexOf('      {/* International Headlines */}');
const featuredBlock = newContent.substring(featuredStart, featuredEnd).trim();

// 6. Extract International Headlines block
const intlStart = newContent.indexOf('      {/* International Headlines */}');
const intlEnd = newContent.indexOf('      {/* LATEST ANALYSIS');
const intlBlock = newContent.substring(intlStart, intlEnd).trim();

// 7. Extract Latest Analysis block
const latestStart = newContent.indexOf('      {/* LATEST ANALYSIS');
const latestEnd = newContent.lastIndexOf('    </motion.div>');
const latestBlock = newContent.substring(latestStart, latestEnd).trim();

// 8. Make Latest Analysis grids 3-column instead of float blocks
let cleanLatestBlock = latestBlock;
// Replace the float wrappers with grid classes
cleanLatestBlock = cleanLatestBlock.replace(/<div className="block -mr-6">[\s\S]*?\{gridArticles\.map\(\(article, i\) => \(/, '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">\n                {gridArticles.map((article, i) => (');
cleanLatestBlock = cleanLatestBlock.replace(/<div key=\{article\.id\} className="float-left w-full md:w-1\/2 lg:w-1\/4 pr-6 pb-6">/g, '<div key={article.id}>');
cleanLatestBlock = cleanLatestBlock.replace(/<\/div>\n                \}\)\}\n                <div className="clear-both"><\/div>\n              <\/div>/, '</div>\n                ))}\n              </div>');

cleanLatestBlock = cleanLatestBlock.replace(/<div className="block -mr-6">[\s\S]*?\{personalizedNews\.map\(\(article, i\) => \(/, '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">\n                {personalizedNews.map((article, i) => (');
cleanLatestBlock = cleanLatestBlock.replace(/<\/div>\n                \}\)\}\n                <div className="clear-both"><\/div>\n              <\/div>/, '</div>\n                ))}\n              </div>');

// 9. Reassemble the Layout
const topPart = newContent.substring(0, rightStart);
const bottomPart = newContent.substring(latestEnd);

const finalCode = topPart +
'      {/* TOP SECTION: FEATURED + SIDEBAR */}\n' +
'      <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">\n' +
'        {/* LEFT: Featured */}\n' +
'        <div className="flex-1 w-full lg:w-2/3">\n' +
'          ' + featuredBlock + '\n' +
'        </div>\n\n' +
'        ' + cleanRightBlock + '\n' +
'      </div>\n\n' +
'      {/* FULL WIDTH SECTIONS BELOW */}\n' +
'      <div className="space-y-12 max-w-7xl mx-auto pt-12">\n' +
'        ' + cleanLatestBlock + '\n\n' +
'        ' + intlBlock + '\n' +
'      </div>\n\n' +
bottomPart;

fs.writeFileSync('src/pages/Home.tsx', finalCode, 'utf-8');
console.log('Final rebuild successful!');

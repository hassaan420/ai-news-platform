const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// 1. Extract Top Part (before RIGHT COLUMN)
const rightColStart = content.indexOf('      {/* RIGHT COLUMN: Sidebar (Floated) */}');
let topPart = content.substring(0, rightColStart);

// 2. Extract Right Column (from rightColStart to LEFT COLUMN CONTENT)
const leftColStart = content.indexOf('      {/* LEFT COLUMN CONTENT */}');
let rightBlock = content.substring(rightColStart, leftColStart);

// 3. Extract Featured (from LEFT COLUMN to International Headlines)
const intlStart = content.indexOf('      {/* International Headlines */}');
let featuredBlock = content.substring(leftColStart, intlStart);

// 4. Extract International (from International to Latest Analysis)
const latestStart = content.indexOf('      {/* LATEST ANALYSIS */}');
let intlBlock = content.substring(intlStart, latestStart);

// 5. Extract Latest Analysis (from Latest Analysis to end)
const endStart = content.lastIndexOf('    </motion.div>');
let latestBlock = content.substring(latestStart, endStart);
let bottomPart = content.substring(endStart);

// --- MODIFICATIONS ---

// Remove infinite scroll logic from topPart
topPart = topPart.replace(/\/\/ Infinite scroll observer\s*useEffect\(\(\) => \{[\s\S]*?\}, \[latestNews, status\]\);/m, '');
topPart = topPart.replace('dispatch(fetchLatestNews({ page, size: 12, dateFilter, from, to }));', '// Fetch 14 items for 3x3 + featured\n    dispatch(fetchLatestNews({ page: 0, size: 14, dateFilter, from, to }));');
topPart = topPart.replace('}, [dispatch, page, dateFilter, from, to]);', '}, [dispatch, dateFilter, from, to]);');

// Remove Load More button from latestBlock
latestBlock = latestBlock.replace(/\{latestNews && !latestNews\.last && \([\s\S]*?<\/button>\s*\)\}\s*<\/div>\s*\)\}/, '');

// Adjust grid classes in latestBlock to be 3-column
latestBlock = latestBlock.replace('className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"');
latestBlock = latestBlock.replace('className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"');

// Adjust grid classes in intlBlock to be 4-column
intlBlock = intlBlock.replace('className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start"');
intlBlock = intlBlock.replace('className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start"');
intlBlock = intlBlock.replace('className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"'); // Fix skeleton which didn't have items-start

// Convert right block to grid column and sticky
rightBlock = rightBlock.replace('className="hidden lg:block float-right w-[33.333%] pl-8 pb-8 relative z-10"', 'className="hidden lg:block xl:col-span-3 lg:col-span-4 sticky top-[104px] space-y-8 pb-8"');
// I will NOT remove any inner divs. The space-y-8 will just wrap it.

// --- REASSEMBLY ---
const newHome = 
topPart +
'      {/* TOP SPLIT LAYOUT */}\n' +
'      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative mb-12">\n' +
'        {/* LEFT COLUMN CONTENT */}\n' +
'        <div className="xl:col-span-9 lg:col-span-8">\n' +
'          ' + featuredBlock.trim() + '\n' +
'        </div>\n\n' +
'        ' + rightBlock.trim() + '\n' +
'      </div>\n\n' +
'      {/* FULL WIDTH SECTIONS BELOW */}\n' +
'      <div className="space-y-12 max-w-7xl mx-auto pt-12 border-t border-border/50">\n' +
'        ' + latestBlock.trim() + '\n\n' +
'        ' + intlBlock.trim() + '\n' +
'      </div>\n\n' +
bottomPart;

fs.writeFileSync('src/pages/Home.tsx', newHome, 'utf-8');
console.log('Done cleanly!');

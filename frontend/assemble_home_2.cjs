const fs = require('fs');
let content = fs.readFileSync('Home.tsx.backup', 'utf-8');

// The original file (Home.tsx.backup) has:
// Top -> Left Column -> (Featured, Intl, Latest) -> </div> -> Right Column -> </div> -> Bottom

// 1. Extract Top definitions
const gridStart = content.indexOf('<div className="grid grid-cols-1 lg:grid-cols-12');
const topPart = content.substring(0, gridStart);

// 2. Extract Featured section
const featuredStart = content.indexOf('          <section>'); // the featured section start
const intlStart = content.indexOf('          {/* International Headlines */}');
const featuredBlock = content.substring(featuredStart, intlStart);

// 3. Extract International section
const latestStart = content.indexOf('          {/* LATEST ANALYSIS */}');
const intlBlock = content.substring(intlStart, latestStart);

// 4. Extract Latest Analysis section
const leftColumnEnd = content.indexOf('        </div>\n\n        {/* RIGHT COLUMN: Sidebar */}');
let latestBlock = content.substring(latestStart, leftColumnEnd);

// 5. Extract Right Column section
const rightStart = content.indexOf('        {/* RIGHT COLUMN: Sidebar */}');
const rightEnd = content.indexOf('      </div>\n    </motion.div>');
const rightBlock = content.substring(rightStart, rightEnd);

const bottomPart = content.substring(rightEnd + 13); // after </div>

// Modification: Remove infinite scroll button from LatestBlock
latestBlock = latestBlock.replace(/\{latestNews && !latestNews\.last && \([\s\S]*?<\/button>\s*\)\}\s*<\/div>\s*\)\}/, '');

// Modification: Fix sizes
// Featured goes in Left column. Let's make left column xl:col-span-9 lg:col-span-8.
const newFeatured = 
'        {/* LEFT COLUMN CONTENT */}\n' +
'        <div className="xl:col-span-9 lg:col-span-8 space-y-12">\n' + 
featuredBlock + 
'        </div>\n';

// Right column becomes xl:col-span-3 lg:col-span-4 sticky
let newRightBlock = rightBlock.replace('className="hidden lg:block lg:col-span-4 space-y-8 pb-8"', 'className="hidden lg:block xl:col-span-3 lg:col-span-4 sticky top-[104px] space-y-8 pb-8"');

// Latest Analysis becomes full width 3-column grid
let newLatestBlock = latestBlock.replace('className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"');

// Intl Headlines becomes full width 4-column grid
let newIntlBlock = intlBlock.replace('className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start"');
// Fix intl skeleton grid
newIntlBlock = newIntlBlock.replace('className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start"');

// Also, the dispatch needs to fetch 14 items, and we should remove the observer. 
let newTopPart = topPart;
// Replace useEffect with IntersectionObserver
newTopPart = newTopPart.replace(/\/\/ Infinite scroll observer\s*useEffect\(\(\) => \{[\s\S]*?\}, \[latestNews, status\]\);/m, '');
// Replace fetch size 12 -> 14
newTopPart = newTopPart.replace('dispatch(fetchLatestNews({ page, size: 12, dateFilter, from, to }));', '// Fetch 14 items for 3x3 + featured\n    dispatch(fetchLatestNews({ page: 0, size: 14, dateFilter, from, to }));');
// Replace page dependency to remove it
newTopPart = newTopPart.replace('}, [dispatch, page, dateFilter, from, to]);', '}, [dispatch, dateFilter, from, to]);');


// Assemble!
const newHome = 
newTopPart +
'<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative mb-12">\n' +
newFeatured +
newRightBlock +
'      </div>\n\n' +
'      {/* FULL WIDTH SECTIONS BELOW */}\n' +
'      <div className="space-y-12 max-w-7xl mx-auto">\n' +
newLatestBlock +
newIntlBlock +
'      </div>\n' +
bottomPart;

fs.writeFileSync('src/pages/Home.tsx', newHome, 'utf-8');
console.log('Done cleanly!');

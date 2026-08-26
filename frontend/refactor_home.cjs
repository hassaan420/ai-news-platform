const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// 1. Top Part (up to the left column start)
const colStart = content.indexOf('<div className="lg:col-span-8 space-y-12">');
let topPart = content.substring(0, colStart);

// 2. Featured Section
const featuredStart = colStart + '<div className="lg:col-span-8 space-y-12">'.length;
const intlStart = content.indexOf('          {/* International Headlines */}');
let featuredBlock = content.substring(featuredStart, intlStart).trim();

// 3. International Headlines Section
const latestStart = content.indexOf('          {/* LATEST ANALYSIS */}');
let intlBlock = content.substring(intlStart, latestStart).trim();

// 4. Latest Analysis Section
const leftColEnd = content.indexOf('        </div>\n\n        {/* RIGHT COLUMN: Sidebar */}');
let latestBlock = content.substring(latestStart, leftColEnd).trim();

// 5. Right Sidebar Section
const rightStart = content.indexOf('        {/* RIGHT COLUMN: Sidebar */}');
const rightEnd = content.indexOf('      </div>\n    </motion.div>');
let rightBlock = content.substring(rightStart, rightEnd).trim();

// 6. Bottom Part
let bottomPart = content.substring(rightEnd);

// --- MODIFICATIONS ---

// Remove infinite scroll logic from topPart
topPart = topPart.replace(/\/\/ Infinite scroll observer\s*useEffect\(\(\) => \{[\s\S]*?\}, \[latestNews, status\]\);/m, '');
topPart = topPart.replace('dispatch(fetchLatestNews({ page, size: 12, dateFilter, from, to }));', '// Fetch 14 items for 3x3 + featured\n    dispatch(fetchLatestNews({ page: 0, size: 14, dateFilter, from, to }));');
topPart = topPart.replace('}, [dispatch, page, dateFilter, from, to]);', '}, [dispatch, dateFilter, from, to]);');

// Remove Load More button from latestBlock
latestBlock = latestBlock.replace(/\{latestNews && !latestNews\.last && \([\s\S]*?<\/button>\s*\)\}\s*<\/div>\s*\)\}/, '');

// Adjust grid classes in latestBlock to be 3-column
latestBlock = latestBlock.replace('className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"');
latestBlock = latestBlock.replace('className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"'); // Do it twice for the personalized news section too

// Adjust grid classes in intlBlock to be 4-column
intlBlock = intlBlock.replace('className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start"');
intlBlock = intlBlock.replace('className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start"');

// Adjust right block to be sticky
rightBlock = rightBlock.replace('className="hidden lg:block lg:col-span-4 space-y-8 pb-8"', 'className="hidden lg:block xl:col-span-3 lg:col-span-4 sticky top-[104px] space-y-8 pb-8"');

// --- REASSEMBLY ---
const newHome = 
topPart +
'        {/* LEFT COLUMN CONTENT */}\n' +
'        <div className="xl:col-span-9 lg:col-span-8 space-y-12">\n' +
'          ' + featuredBlock + '\n' +
'        </div>\n\n' +
'        ' + rightBlock + '\n' +
'      </div>\n\n' +
'      {/* FULL WIDTH SECTIONS BELOW */}\n' +
'      <div className="space-y-12 max-w-7xl mx-auto pt-12">\n' +
'        ' + latestBlock + '\n\n' +
'        ' + intlBlock + '\n' +
'      </div>\n\n' +
'    </motion.div>\n' +
'  );\n' +
'}\n';

fs.writeFileSync('src/pages/Home.tsx', newHome, 'utf-8');
console.log('Done cleanly!');

const fs = require('fs');
let content = fs.readFileSync('Home_full.tsx.txt', 'utf-8');

// The original file (Home_full.tsx.txt) has sections. We'll extract them using regex/indexOf and rebuild.

// 1. Extract Top definitions (Imports to <div className="grid... lg:grid-cols-12...">)
const gridStart = content.indexOf('<div className="grid grid-cols-1 lg:grid-cols-12');
const topPart = content.substring(0, gridStart);

// 2. Extract Featured section
const featuredStart = content.indexOf('<div className="xl:col-span-9');
const featuredEnd = content.indexOf('          {/* LATEST ANALYSIS */}');
const featuredBlock = content.substring(featuredStart, featuredEnd);

// 3. Extract Latest Analysis section
const latestStart = content.indexOf('          {/* LATEST ANALYSIS */}');
const latestEnd = content.indexOf('          {/* International Headlines */}');
const latestBlock = content.substring(latestStart, latestEnd);

// 4. Extract International Headlines section
const intlStart = content.indexOf('          {/* International Headlines */}');
const intlEnd = content.indexOf('        {/* RIGHT COLUMN: Sidebar */}');
const intlBlock = content.substring(intlStart, intlEnd);

// 5. Extract Right Column section
const rightStart = content.indexOf('        {/* RIGHT COLUMN: Sidebar */}');
const rightEnd = content.lastIndexOf('      </div>'); // End of grid
const rightBlock = content.substring(rightStart, rightEnd);

// 6. Extract Bottom part (from end of grid to end of file)
const bottomPart = content.substring(rightEnd + 12); // after </div>

// Rebuild Layout
// 1. We keep TopPart
// 2. We output Grid start
// 3. We output Featured (left column)
// 4. We output Right Column
// 5. We close Grid
// 6. We output Latest Analysis (wrapped nicely)
// 7. We output International Headlines (wrapped nicely)
// 8. We output BottomPart

// Fix Latest Analysis grid sizing to be full-width 3x3
let newLatestBlock = latestBlock.replace('className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"');

// Fix International Headlines grid sizing to be 4 columns
let newIntlBlock = intlBlock.replace('className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start"');

// Remove sticky from right sidebar since it's now top-level? No, user wants it sticky next to Featured.
let newRightBlock = rightBlock.replace('sticky top-[104px] h-[calc(100vh-104px)] overflow-y-auto sidebar-scroll space-y-8 pb-8 pr-2', 'sticky top-[104px] space-y-8 pb-8'); // let's just make it standard sticky, no forced height, so it sticks nicely.

const newHome = 
topPart +
'<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative mb-12">\n' +
featuredBlock + '\n' +
newRightBlock + '\n' +
'      </div>\n' +
'\n      {/* FULL WIDTH SECTIONS BELOW */} \n' +
'      <div className="space-y-12">\n' +
newLatestBlock + '\n' +
newIntlBlock + '\n' +
'      </div>\n' +
bottomPart;

fs.writeFileSync('src/pages/Home.tsx', newHome, 'utf-8');
console.log('Successfully reassembled Home.tsx');

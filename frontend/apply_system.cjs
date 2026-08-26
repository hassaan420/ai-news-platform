const fs = require('fs');

// 1. UPDATE index.css
let css = fs.readFileSync('src/index.css', 'utf-8');

// Replace old glass tokens with new ones
const glassTokens = 
'    /* -----------------------------------------------------\n' +
'       GLASS SYSTEM\n' +
'       ----------------------------------------------------- */\n' +
'    --glass-bg-1: rgba(255, 255, 255, 0.03);\n' +
'    --glass-border-1: rgba(255, 255, 255, 0.06);\n' +
'    \n' +
'    --glass-bg-2: rgba(255, 255, 255, 0.06);\n' +
'    --glass-border-2: rgba(255, 255, 255, 0.12);\n' +
'    \n' +
'    --glass-bg-3: rgba(255, 255, 255, 0.12);\n' +
'    --glass-border-3: rgba(255, 255, 255, 0.20);\n' +
'    \n' +
'    --glass-highlight: inset 0 1px 0 0 rgba(255, 255, 255, 0.15);\n';

css = css.replace(/\/\* \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\n\s*GLASS\n\s*\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\- \*\/\n[\s\S]*?(?=\/\* \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-)/m, glassTokens);

const glassClasses = 
'@layer components {\n' +
'  .glass-1 {\n' +
'    background: var(--glass-bg-1);\n' +
'    border: 1px solid var(--glass-border-1);\n' +
'    backdrop-filter: blur(16px);\n' +
'    -webkit-backdrop-filter: blur(16px);\n' +
'    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);\n' +
'  }\n' +
'  .glass-2 {\n' +
'    background: var(--glass-bg-2);\n' +
'    border: 1px solid var(--glass-border-2);\n' +
'    backdrop-filter: blur(24px) saturate(120%);\n' +
'    -webkit-backdrop-filter: blur(24px) saturate(120%);\n' +
'    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), var(--glass-highlight);\n' +
'  }\n' +
'  .glass-3 {\n' +
'    background: var(--glass-bg-3);\n' +
'    border: 1px solid var(--glass-border-3);\n' +
'    backdrop-filter: blur(32px) saturate(140%);\n' +
'    -webkit-backdrop-filter: blur(32px) saturate(140%);\n' +
'    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), var(--glass-highlight);\n' +
'  }\n' +
'  .glass-panel {\n' +
'    @apply glass-2;\n' +
'    border-radius: var(--radius);\n' +
'  }\n';

css = css.replace(/@layer components\s*\{[\s\S]*?(?=\.ambient-rose-hero)/m, glassClasses + '\n  ');

fs.writeFileSync('src/index.css', css, 'utf-8');

// 2. UPDATE App.tsx (Readability Veil)
let appTsx = fs.readFileSync('src/App.tsx', 'utf-8');
appTsx = appTsx.replace('<ShaderBackground className="fixed inset-0 z-0 pointer-events-none" />', 
  '<ShaderBackground className="fixed inset-0 z-0 pointer-events-none opacity-85" />\n        {/* Global Readability Veil */}\n        <div className="fixed inset-0 z-0 pointer-events-none bg-background/40 backdrop-blur-[2px]" />');
fs.writeFileSync('src/App.tsx', appTsx, 'utf-8');

// 3. UPDATE MainLayout.tsx (Page Gutter & Width)
let layoutTsx = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf-8');
// Fix layout padding to use specific scale (e.g. 16px mobile, 24px tablet, 32px desktop)
layoutTsx = layoutTsx.replace('px-4 md:px-8 xl:px-12', 'px-4 md:px-6 lg:px-8 xl:px-10');
fs.writeFileSync('src/layouts/MainLayout.tsx', layoutTsx, 'utf-8');

console.log('System foundations updated.');

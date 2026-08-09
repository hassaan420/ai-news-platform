const fs = require('fs');
const path = require('path');

const hexToHsl = (hex) => {
  let r = 0, g = 0, b = 0;
  if (hex.length == 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length == 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  r /= 255; g /= 255; b /= 255;
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return [h, s, l];
};

const tailwindPath = path.join(__dirname, 'tailwind.config.js');
let config = fs.readFileSync(tailwindPath, 'utf8');

const colorRegex = /"([^"]+)":\s*"#([0-9a-fA-F]{6})"/g;
const colors = {};
let match;
while ((match = colorRegex.exec(config)) !== null) {
  colors[match[1]] = '#' + match[2];
}

let rootVars = '';
let darkVars = '';

for (const [key, hex] of Object.entries(colors)) {
  const [h, s, l] = hexToHsl(hex);
  
  rootVars += `    --${key}: ${h} ${s}% ${l}%;\n`;
  
  let lDark = 100 - l;
  if (key.includes('primary') || key.includes('tertiary') || key.includes('error') || key.includes('outline')) {
      if(l < 30) lDark = l + 40;
      else if(l > 70) lDark = l - 40;
      else lDark = l;
  }
  
  darkVars += `    --${key}: ${h} ${s}% ${lDark.toFixed(1)}%;\n`;
  
  config = config.replace(`"${key}": "${hex}"`, `"${key}": "hsl(var(--${key}))"`);
}

fs.writeFileSync(tailwindPath, config);

const indexPath = path.join(__dirname, 'src', 'index.css');
let indexCss = fs.readFileSync(indexPath, 'utf8');

indexCss = indexCss.replace(
  /:root {/,
  `:root {\n${rootVars}`
);

indexCss = indexCss.replace(
  /\.dark {/,
  `.dark {\n${darkVars}`
);

fs.writeFileSync(indexPath, indexCss);
console.log('Conversion complete');

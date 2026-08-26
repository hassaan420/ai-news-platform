const fs = require('fs');

let config = fs.readFileSync('tailwind.config.js', 'utf-8');

config = config.replace(
  /"display-lg": \["48px", \{ lineHeight: "56px", letterSpacing: "\-0\.02em", fontWeight: "700" \}\]/,
  '"display-lg": ["56px", { lineHeight: "64px", letterSpacing: "-0.025em", fontWeight: "700" }]'
);

config = config.replace(
  /"headline-md": \["24px", \{ lineHeight: "32px", fontWeight: "600" \}\]/,
  '"headline-md": ["28px", { lineHeight: "36px", fontWeight: "700", letterSpacing: "-0.015em" }]'
);

config = config.replace(
  /"body-md": \["16px", \{ lineHeight: "24px", fontWeight: "400" \}\]/,
  '"body-md": ["16px", { lineHeight: "26px", fontWeight: "400" }]'
);

// We need to add an extra one for the Article title so it's a bit larger
config = config.replace(
  /"body-lg": \["18px", \{ lineHeight: "28px", fontWeight: "400" \}\]/,
  '"body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],\n        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600", letterSpacing: "-0.01em" }]'
);

fs.writeFileSync('tailwind.config.js', config, 'utf-8');
console.log('Typography updated.');

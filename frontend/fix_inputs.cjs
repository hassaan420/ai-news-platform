
const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf-8');

const inputClasses = 
\
/* =========================================================
   FORM INPUTS & BUTTONS
   ========================================================= */
@layer components {
  .clarion-input {
    @apply w-full h-11 px-4 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-primary-theme placeholder:text-muted-theme/70 outline-none transition-all duration-200;
  }
  .clarion-input:focus {
    @apply bg-black/10 dark:bg-white/10 border-primary ring-2 ring-primary/20;
  }
  .clarion-input:disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .clarion-btn {
    @apply inline-flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all duration-200 outline-none;
  }
  .clarion-btn-primary {
    @apply bg-primary text-white hover:bg-primary/90 shadow-premium;
  }
  .clarion-btn-secondary {
    @apply glass-2 text-primary-theme hover:bg-white/10;
  }
  .clarion-btn-ghost {
    @apply text-secondary-theme hover:text-primary-theme hover:bg-black/5 dark:hover:bg-white/5;
  }
}
\;

content = content + inputClasses;
fs.writeFileSync('src/index.css', content, 'utf-8');
console.log('Inputs updated.');


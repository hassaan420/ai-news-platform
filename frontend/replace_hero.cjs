const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const oldHero = 
\      {isAuthenticated && user?.name && (
        <div className="mb-8 block">
          <h1 className="text-3xl font-headline-md text-foreground">Welcome back, {user.name}</h1>
        </div>
      )}\;

const newHero = 
\      {/* GLOBAL CINEMATIC HERO */}
      <div className="text-center py-16 md:py-24 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full glass-1 border border-border/50 text-xs font-bold tracking-widest text-primary uppercase">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Live Global Intelligence
        </div>
        <h1 className="font-serif text-[42px] md:text-[56px] leading-[1.1] font-bold text-heading-theme mb-6 tracking-tight">
          {isAuthenticated && user?.name ? \\\Welcome back, \.\\\ : 'Your window into the world.'}
          <br/>
          <span className="text-muted-theme">Understand what matters.</span>
        </h1>
        <p className="font-sans text-[16px] md:text-[18px] leading-relaxed text-secondary-theme mb-10 max-w-2xl mx-auto">
          Clarion AI analyzes millions of global data points in real-time to bring you unparalleled intelligence, removing the noise so you can focus on the signal.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => {
              document.getElementById('latest-analysis-section')?.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="px-6 py-3 rounded-lg bg-primary text-white font-bold tracking-wide hover:bg-primary/90 transition-all shadow-premium"
          >
            Explore Latest Stories
          </button>
          {isAuthenticated && (
            <button onClick={() => {
                setActiveTab('foryou');
                document.getElementById('latest-analysis-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-lg glass-2 text-primary-theme font-bold tracking-wide hover:bg-white/10 transition-all"
            >
              Your Personalized Brief
            </button>
          )}
        </div>
      </div>\;

content = content.replace(oldHero, newHero);
fs.writeFileSync('src/pages/Home.tsx', content, 'utf-8');
console.log('Hero replaced.');

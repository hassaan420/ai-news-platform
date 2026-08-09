import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="bg-background text-foreground font-sans text-body-md antialiased min-h-screen flex flex-col md:flex-row w-full absolute top-0 left-0 z-50">
      {/* Left Side: Editorial Abstract (Hidden on Mobile) */}
      <div className="hidden md:flex w-1/2 relative bg-surface-container items-center justify-center overflow-hidden">
        {/* Ambient gradient instead of external image */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, hsl(243 50% 20%) 0%, hsl(228 30% 12%) 40%, hsl(220 20% 8%) 100%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 30% 40%, hsl(243 80% 65% / 0.3), transparent),
              radial-gradient(ellipse 40% 40% at 70% 60%, hsl(20 80% 55% / 0.15), transparent)
            `,
          }}
        />
        <div className="relative z-10 px-margin_desktop max-w-lg text-center">
          <Link to="/">
            <h2 className="font-display-lg text-display-lg text-white/90 tracking-tight mb-stack_sm hover:opacity-80 transition-opacity">Clarion</h2>
          </Link>
          <p className="font-body-lg text-body-lg text-white/60">Intelligent, objective, and calm. AI-curated news for the discerning reader.</p>
        </div>
      </div>
      
      {/* Right Side: Auth Container */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-margin_mobile md:p-margin_desktop min-h-screen bg-background">
        <div className="w-full max-w-md bg-card rounded-xl border border-border/60 p-stack_lg shadow-premium relative">
          
          <Link to="/" className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </Link>

          {/* Mobile Brand (Hidden on Desktop) */}
          <div className="md:hidden text-center mb-stack_lg">
            <Link to="/">
              <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tight">Clarion</h1>
            </Link>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-border/60 mb-stack_lg relative">
            <Link 
              to="/login" 
              className={`flex-1 pb-stack_sm text-center font-label-sm text-label-sm border-b-2 transition-colors focus:outline-none ${isLogin ? 'text-primary border-primary' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
            >
              Log In
            </Link>
            <Link 
              to="/register" 
              className={`flex-1 pb-stack_sm text-center font-label-sm text-label-sm border-b-2 transition-colors focus:outline-none ${!isLogin ? 'text-primary border-primary' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
            >
              Sign Up
            </Link>
          </div>
          
          {/* Auth Form Area */}
          {children}

          <div className="mt-stack_lg text-center">
            <p className="font-metadata text-metadata text-muted-foreground">
              By continuing, you agree to our <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

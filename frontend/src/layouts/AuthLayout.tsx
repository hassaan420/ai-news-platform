import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import { SparklesCore } from '../components/ui/sparkles';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="text-foreground font-sans antialiased min-h-screen flex flex-col items-center justify-center p-6 relative z-50">
      
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-background/40 pointer-events-none" />
      
      {/* Ambient Sparkles Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <SparklesCore
          id="tsparticlesauthpage"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={20}
          className="w-full h-full"
          particleColor="var(--glow-rose-soft)"
        />
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-secondary-theme hover:text-primary-theme rounded-md transition-all duration-200 ease-out cursor-pointer hover:bg-black/5 dark:hover:bg-white/5">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center justify-center gap-3 mb-6 hover:scale-105 transition-transform duration-300">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 shadow-lg">
              <svg className="w-6 h-6 text-heading-theme drop-shadow-sm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8C16.8 5.5 14.5 4 12 4C7.6 4 4 7.6 4 12C4 16.4 7.6 20 12 20C14.5 20 16.8 18.5 18 16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="3.5" fill="currentColor" />
              </svg>
            </div>
            <span className="font-sans font-extrabold tracking-[0.2em] uppercase text-2xl text-heading-theme mt-1">Clarion</span>
          </Link>
          <h1 className="font-sans text-2xl font-bold mb-2 text-heading-theme">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-secondary-theme text-sm">
            {isLogin ? 'Log in to continue to Clarion.' : 'Sign up to personalize your news experience.'}
          </p>
        </div>

        <div className="w-full glass-3 rounded-2xl p-8 shadow-premium relative border border-border/50">
          
          {/* Auth Form Area */}
          <div className="mb-6">
            {children}
          </div>

          <div className="text-center text-sm pt-6 border-t border-border/50 mt-2">
            {isLogin ? (
              <p className="text-secondary-theme">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-theme hover:text-primary font-bold transition-colors">
                  Sign up
                </Link>
              </p>
            ) : (
              <p className="text-secondary-theme">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-theme hover:text-primary font-bold transition-colors">
                  Log in
                </Link>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

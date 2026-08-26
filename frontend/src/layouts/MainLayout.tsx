import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import LiveTickerBar from '../components/LiveTickerBar';
import { SparklesCore } from '../components/ui/sparkles';

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <div className="text-foreground font-sans antialiased min-h-screen flex flex-col relative transition-colors duration-300">
      
      {/* Ambient Sparkles Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={20}
          className="w-full h-full"
          particleColor="var(--glow-rose-soft)"
        />
      </div>

      {/* Top Navbar (Full Width) */}
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />

      {/* Live News Ticker - under Navbar */}
      <div className="pt-16">
        <LiveTickerBar />
      </div>

      <div className="flex flex-1 w-full">

        {/* Left Sidebar (Desktop) */}
        <div className="hidden md:block sticky top-[104px] h-[calc(100vh-104px)] w-[240px] flex-shrink-0 z-40 border-r border-border glass-subtle overflow-y-auto sidebar-scroll pr-4 pl-4 pb-8">
          <Sidebar />
        </div>

        {/* Left Sidebar (Mobile Drawer) — Animated with Framer Motion */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div
              className="md:hidden fixed inset-0 z-50 overflow-hidden"
              aria-modal="true"
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-background/60 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Animated drawer panel */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="absolute top-0 left-0 bottom-0 w-[280px] glass-strong shadow-2xl overflow-y-auto z-10 flex flex-col"
              >
                <div className="p-4 flex items-center justify-between border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20">
                      <svg className="w-4 h-4 text-heading-theme drop-shadow-sm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 8C16.8 5.5 14.5 4 12 4C7.6 4 4 7.6 4 12C4 16.4 7.6 20 12 20C14.5 20 16.8 18.5 18 16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
                        <circle cx="12" cy="12" r="3.5" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="font-sans text-base font-extrabold text-heading-theme tracking-[0.15em] uppercase mt-0.5">Clarion</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-secondary-theme hover:text-primary-theme rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    aria-label="Close navigation menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <Sidebar />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Canvas */}
        <main className="flex-1 min-w-0 pb-16 pt-8 px-4 md:px-6 lg:px-8 xl:px-10">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

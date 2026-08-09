import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const linkClass = (path: string) => {
    const base = "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors duration-200";
    if (isActive(path)) {
      return `${base} bg-primary/10 text-primary font-semibold`;
    }
    return `${base} text-muted-foreground hover:text-foreground hover:bg-muted/60`;
  };

  const categoryIconMap: Record<string, string> = {
    Politics: 'account_balance',
    Technology: 'memory',
    Business: 'trending_up',
    Science: 'science',
    Health: 'health_and_safety',
    Sports: 'sports_basketball',
  };

  return (
    <motion.nav 
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="hidden md:flex bg-background/80 backdrop-blur-xl fixed left-0 top-0 h-screen w-sidebar_width flex-col py-6 px-4 z-40 transition-colors duration-300 border-r border-border/30"
      aria-label="Main navigation"
    >
      <div className="mb-8 px-4">
        <Link to="/" className="block">
          <span className="font-display-lg text-[28px] leading-tight text-primary tracking-tight">Clarion</span>
        </Link>
        <p className="font-metadata text-[12px] text-muted-foreground mt-1 tracking-wide uppercase">AI-Curated News</p>
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-1">
        <Link className={linkClass('/')} to="/">
          <span className="material-symbols-outlined text-[20px]">home</span>
          <span>Home</span>
        </Link>
        <Link className={linkClass('/trending')} to="/trending">
          <span className="material-symbols-outlined text-[20px]">trending_up</span>
          <span>Trending</span>
        </Link>
        {isAuthenticated && (
          <Link className={linkClass('/saved')} to="/saved">
            <span className="material-symbols-outlined text-[20px]">bookmark</span>
            <span>Saved</span>
          </Link>
        )}
        
        <div className="mt-6 mb-3 px-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Categories</span>
        </div>
        
        {['Politics', 'Technology', 'Business', 'Science', 'Health', 'Sports'].map((cat) => (
          <Link
            key={cat}
            className={linkClass(`/category/${cat.toLowerCase()}`)}
            to={`/category/${cat.toLowerCase()}`}
          >
            <span className="material-symbols-outlined text-[18px]">{categoryIconMap[cat] || 'category'}</span>
            <span>{cat}</span>
          </Link>
        ))}
      </div>
      
      {!isAuthenticated && (
        <div className="mt-auto px-2 pt-4">
          <Link to="/register" className="w-full bg-primary text-primary-foreground font-label-sm text-label-sm py-2.5 rounded-lg transition-colors hover:bg-primary/90 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">star</span>
            Get Started
          </Link>
        </div>
      )}
    </motion.nav>
  );
}

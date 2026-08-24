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
    const base = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200";
    if (isActive(path)) {
      return `${base} bg-foreground/[0.05] text-foreground`;
    }
    return `${base} text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]`;
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
      className="hidden md:flex bg-transparent fixed left-0 top-0 h-screen w-sidebar_width flex-col py-8 px-4 z-40 transition-colors duration-300"
      aria-label="Main navigation"
    >
      <div className="mb-10 px-4">
        <Link to="/" className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted-foreground opacity-50" strokeDasharray="2 4" />
            <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-foreground" />
          </svg>
          <span className="font-sans text-[20px] font-bold text-foreground tracking-[0.15em] uppercase mt-0.5">Clarion</span>
        </Link>
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
          <Link to="/register" className="w-full bg-foreground/[0.06] text-foreground font-label-sm text-[13px] py-2.5 rounded-xl transition-all hover:bg-foreground/[0.1] flex items-center justify-center gap-2 border border-border">
            <span className="material-symbols-outlined text-[16px]">login</span>
            Sign In
          </Link>
        </div>
      )}
    </motion.nav>
  );
}

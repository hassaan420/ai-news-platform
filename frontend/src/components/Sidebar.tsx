import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { motion } from 'framer-motion';
import { Home, TrendingUp, Bookmark, Cpu, FlaskConical, HeartPulse, Trophy, Landmark, Grid3X3, LogIn, Shield } from 'lucide-react';

export default function Sidebar() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) => {
    const base = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative";
    if (isActive(path)) {
      return `${base} glass-2 text-primary-theme shadow-sm`;
    }
    return `${base} text-secondary-theme hover:text-primary-theme hover:bg-black/5 dark:hover:bg-white/5 border border-transparent`;
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Politics': return <Landmark className="w-[18px] h-[18px] opacity-70 group-hover:opacity-100 transition-opacity" />;
      case 'Technology': return <Cpu className="w-[18px] h-[18px] opacity-70 group-hover:opacity-100 transition-opacity" />;
      case 'Science': return <FlaskConical className="w-[18px] h-[18px] opacity-70 group-hover:opacity-100 transition-opacity" />;
      case 'Health': return <HeartPulse className="w-[18px] h-[18px] opacity-70 group-hover:opacity-100 transition-opacity" />;
      case 'Sports': return <Trophy className="w-[18px] h-[18px] opacity-70 group-hover:opacity-100 transition-opacity" />;
      case 'Business': return <TrendingUp className="w-[18px] h-[18px] opacity-70 group-hover:opacity-100 transition-opacity" />;
      default: return <Grid3X3 className="w-[18px] h-[18px] opacity-70 group-hover:opacity-100 transition-opacity" />;
    }
  };

  return (
    <nav aria-label="Main navigation" className="py-2 flex flex-col gap-6 h-full min-h-[500px]">

      {/* Main Section */}
      <div className="space-y-1.5">
        <Link to="/home" className={linkClass('/home')}>
          {isActive('/home') && <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />}
          <Home className="w-[18px] h-[18px] transition-colors ml-1 opacity-70 group-hover:opacity-100" />
          <span>Home</span>
        </Link>
        <Link to="/trending" className={linkClass('/trending')}>
          {isActive('/trending') && <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />}
          <TrendingUp className="w-[18px] h-[18px] transition-colors ml-1 opacity-70 group-hover:opacity-100" />
          <span>Trending</span>
        </Link>
        <Link to="/saved" className={linkClass('/saved')}>
          {isActive('/saved') && <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />}
          <Bookmark className="w-[18px] h-[18px] transition-colors ml-1 opacity-70 group-hover:opacity-100" />
          <span>Saved Articles</span>
        </Link>
      </div>

      {/* Categories Section */}
      <div>
        <h3 className="px-3 label-section mb-3">Categories</h3>
        <div className="space-y-1.5">
          {['Technology', 'Business', 'Science', 'Health', 'Sports', 'Politics'].map((cat) => {
            const path = `/category/${cat.toLowerCase()}`;
            return (
              <Link key={cat} to={path} className={linkClass(path)}>
                {isActive(path) && <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />}
                <div className="ml-1">{getCategoryIcon(cat)}</div>
                <span>{cat}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Explore Section */}
      <div>
        <h3 className="px-3 label-section mb-3">Explore</h3>
        <div className="space-y-1.5">
          <Link to="/search" className={linkClass('/search')}>
            {isActive('/search') && <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />}
            <Grid3X3 className="w-[18px] h-[18px] transition-colors ml-1 opacity-70 group-hover:opacity-100" />
            <span>Discover</span>
          </Link>

          {user?.role === 'ROLE_ADMIN' && (
            <Link to="/admin" className={linkClass('/admin')}>
              {isActive('/admin') && <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />}
              <Shield className="w-[18px] h-[18px] transition-colors ml-1 opacity-70 group-hover:opacity-100" />
              <span>Admin Control Center</span>
            </Link>
          )}
        </div>
      </div>

      {/* Auth State */}
      {!isAuthenticated && (
        <div className="mt-4 pt-4 border-t border-white/[0.05]">
          <Link to="/login" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/[0.12] backdrop-blur-xl border border-white/[0.2] text-sm font-medium text-white hover:bg-white/[0.2] hover:text-white transition-all duration-300">
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
        </div>
      )}
    </nav>
  );
}

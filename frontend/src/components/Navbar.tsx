import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { fetchAllCategories } from '@/store/categorySlice';
import { motion } from 'framer-motion';
import { Menu, Search, User, LogOut } from 'lucide-react';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query?.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 h-[72px] glass-3 transition-colors duration-300 flex items-center px-4 md:px-6 lg:px-8 xl:px-10 border-b border-border"
    >
      <div className="flex items-center justify-between gap-4 w-full">

        {/* Mobile Menu Button */}
        <button onClick={onMenuClick} className="md:hidden text-secondary-theme hover:text-primary-theme transition-colors p-2 -ml-2" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <svg className="w-5 h-5 relative z-10 text-heading-theme drop-shadow-sm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8C16.8 5.5 14.5 4 12 4C7.6 4 4 7.6 4 12C4 16.4 7.6 20 12 20C14.5 20 16.8 18.5 18 16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="3.5" fill="currentColor" />
            </svg>
          </div>
          <span className="font-sans text-lg font-extrabold text-heading-theme tracking-[0.15em] uppercase hidden sm:block mt-0.5">Clarion</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full max-w-lg mx-auto hidden md:block group px-8">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-muted-theme group-focus-within:text-primary-theme transition-colors pointer-events-none" />
            <input
              name="search"
              className="clarion-input pl-10 rounded-full bg-black/5 dark:bg-white/5 focus:bg-black/10 dark:focus:bg-white/10"
              placeholder="Search for a story..."
              type="text"
            />
          </div>
        </form>

        <div className="flex-1 md:hidden" />

        {/* Auth / Profile */}
        <div className="flex items-center gap-4 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="hidden lg:block text-sm font-medium text-secondary-theme">
                {user?.name || 'User'}
              </span>
              {user?.role === 'ROLE_ADMIN' && (
                <Link to="/admin" className="hidden sm:block clarion-btn clarion-btn-secondary px-3 py-1.5 text-xs">
                  Admin
                </Link>
              )}
              <Link to="/profile" className="clarion-btn clarion-btn-secondary w-9 h-9 p-0 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLogout}
                className="clarion-btn clarion-btn-ghost w-9 h-9 p-0 rounded-full flex items-center justify-center text-muted-theme hover:text-primary-theme"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="clarion-btn clarion-btn-ghost">
                Log In
              </Link>
              <Link to="/register" className="clarion-btn clarion-btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </motion.header>
  );
}

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { fetchAllCategories } from '@/store/categorySlice';
import { useTheme } from './ThemeProvider';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

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
    const query = formData.get('search');
    if (query) navigate(`/search?q=${query}`);
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="bg-background/80 backdrop-blur-xl sticky top-0 z-30 flex justify-between items-center h-16 px-margin_mobile md:px-margin_desktop w-full transition-colors duration-300 border-b border-border/40"
    >
      <div className="flex items-center flex-1">
        {/* Mobile Menu Button */}
        <button className="md:hidden mr-4 text-muted-foreground hover:text-foreground transition-colors" aria-label="Open menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <form onSubmit={handleSearch} className="relative w-full max-w-md hidden md:block group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors text-[18px]">search</span>
          <input
            name="search"
            className="w-full bg-muted/50 border border-transparent rounded-lg py-2 pl-10 pr-4 font-sans text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-background focus:outline-none transition-all text-foreground placeholder:text-muted-foreground"
            placeholder="Search curated news..."
            type="text"
          />
        </form>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted focus:ring-2 focus:ring-primary outline-none"
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined text-[20px]">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
        </button>
        
        {isAuthenticated ? (
          <div className="flex items-center space-x-1">
            <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted focus:ring-2 focus:ring-primary outline-none" aria-label="Profile">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </Link>
            {user?.role === 'ROLE_ADMIN' && (
              <Link to="/admin" className="font-label-sm text-label-sm text-muted-foreground hover:text-foreground transition-colors focus:ring-2 focus:ring-primary outline-none px-3 py-2 rounded-lg hover:bg-muted">
                Admin
              </Link>
            )}
            <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted focus:ring-2 focus:ring-primary outline-none" aria-label="Log out">
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link to="/login" className="font-label-sm text-label-sm text-muted-foreground hover:text-foreground transition-colors focus:ring-2 focus:ring-primary outline-none px-3 py-2 rounded-lg hover:bg-muted">
              Log In
            </Link>
            <Link to="/register" className="font-label-sm text-label-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors focus:ring-2 focus:ring-primary outline-none">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </motion.header>
  );
}

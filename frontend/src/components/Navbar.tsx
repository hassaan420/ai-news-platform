import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { fetchAllCategories } from '@/store/categorySlice';
import { motion } from 'framer-motion';

export default function Navbar() {
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
    const query = formData.get('search');
    if (query) navigate(`/search?q=${query}`);
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="bg-background/70 backdrop-blur-xl sticky top-0 z-30 flex justify-between items-center h-20 px-margin_mobile md:px-margin_desktop w-full transition-colors duration-300"
    >
      <div className="flex items-center flex-1">
        {/* Mobile Menu Button */}
        <button className="md:hidden mr-4 text-muted-foreground hover:text-foreground transition-colors" aria-label="Open menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <form onSubmit={handleSearch} className="relative w-full max-w-lg hidden md:block group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors text-[18px]">search</span>
          <input
            name="search"
            className="w-full bg-foreground/[0.03] border border-border rounded-full py-2.5 pl-12 pr-4 font-sans text-[14px] focus:ring-1 focus:ring-foreground/20 focus:border-border focus:bg-foreground/[0.05] focus:outline-none transition-all text-foreground placeholder:text-muted-foreground shadow-subtle"
            placeholder="Search Clarion Intelligence..."
            type="text"
          />
        </form>
      </div>
      <div className="flex items-center space-x-2">
        
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
          <div className="flex items-center space-x-3">
            <Link to="/login" className="font-label-sm text-[13px] text-muted-foreground hover:text-foreground transition-colors outline-none px-2 rounded-lg">
              Log In
            </Link>
            <Link to="/register" className="font-label-sm text-[13px] bg-foreground text-background px-4 py-2 rounded-full hover:opacity-90 transition-all shadow-subtle outline-none font-semibold tracking-wide">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </motion.header>
  );
}

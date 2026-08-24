import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, updateUser } from '@/store/authSlice';
import { newsApi } from '@/api/newsApi';
import { authApi } from '@/api/authApi';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';

export default function Profile() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [savedArticlesCount, setSavedArticlesCount] = useState(0);
  const [articlesReadCount, setArticlesReadCount] = useState(0);
  const { theme, setTheme } = useTheme();
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    if (user) {
      newsApi.getSavedArticles(0, 1)
        .then(data => setSavedArticlesCount(data.totalElements || 0))
        .catch(err => console.error("Failed to fetch saved articles count", err));
        
      newsApi.getReadingCount()
        .then(data => setArticlesReadCount(data.articlesRead || 0))
        .catch(err => console.error("Failed to fetch reading count", err));
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSaveStatus(null);
    try {
      const updatedUser = await authApi.updateProfile({ name, bio });
      dispatch(updateUser(updatedUser));
      setSaveStatus({ type: 'success', message: 'Profile saved successfully.' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err?.response?.data?.message || 'Failed to save changes.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Admin';
      case 'ROLE_USER': return 'User';
      default: return role.replace('ROLE_', '');
    }
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="pb-12 max-w-max_content_width mx-auto"
    >
      <div className="mb-stack_lg border-b border-border/30 pb-8 mt-8 md:mt-0">
        <h2 className="font-display-lg text-[40px] leading-[48px] text-foreground tracking-tight mb-2">Profile Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account details and reading preferences.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: Avatar & Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-card rounded-xl shadow-premium p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group cursor-pointer">
              <div className="w-28 h-28 rounded-full bg-primary/15 text-primary flex items-center justify-center text-3xl font-bold uppercase overflow-hidden">
                {user.name.charAt(0)}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="material-symbols-outlined text-white">edit</span>
              </div>
              {/* TODO: Implement avatar image upload handler in the future */}
            </div>
            <h3 className="font-headline-md text-headline-md text-foreground">{user.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
            <p className="text-[11px] font-semibold text-primary bg-primary/10 px-3 py-1 rounded-md mb-6 uppercase tracking-wider">{formatRole(user.role)}</p>
            <button 
              onClick={handleSignOut}
              className="w-full text-sm font-medium border border-border/60 text-destructive py-2.5 rounded-lg hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </button>
          </div>
          
          <div className="bg-card rounded-xl shadow-subtle p-6">
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">Preferences</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Dark Mode</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">Toggle interface theme</p>
              </div>
              <button 
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${isDark ? 'bg-primary' : 'bg-muted border border-border/60'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full transition-transform ${isDark ? 'translate-x-6 bg-primary-foreground' : 'translate-x-1 bg-muted-foreground'}`}></span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Column: Details & Insights */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-card rounded-xl shadow-premium p-6 md:p-8">
            <h3 className="font-headline-md text-headline-md text-foreground mb-6">Account Details</h3>
            <form className="space-y-5" onSubmit={handleSave}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-muted-foreground">Full Name</label>
                <input 
                  className="border border-border/60 rounded-lg p-3 text-sm bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-foreground" 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isUpdating}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-muted-foreground">Email Address</label>
                <input 
                  className="border border-border/60 rounded-lg p-3 text-sm bg-muted text-muted-foreground outline-none cursor-not-allowed" 
                  type="email" 
                  value={user.email}
                  readOnly
                  disabled
                />
                <p className="text-[11px] text-muted-foreground mt-0.5 ml-1">Email cannot be changed.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-muted-foreground">Bio (Optional)</label>
                <textarea 
                  className="border border-border/60 rounded-lg p-3 text-sm bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all resize-none text-foreground" 
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={isUpdating}
                  placeholder="Tell us a little about yourself..."
                ></textarea>
              </div>
              <div className="pt-4 flex items-center justify-end gap-4">
                {saveStatus && (
                  <span className={`text-sm ${saveStatus.type === 'error' ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                    {saveStatus.message}
                  </span>
                )}
                <button 
                  className="text-sm font-medium bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2" 
                  type="submit"
                  disabled={isUpdating || !name.trim()}
                >
                  {isUpdating ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-card rounded-xl shadow-premium p-6 md:p-8">
            <h3 className="font-headline-md text-headline-md text-foreground mb-6">Reading Insights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-background border border-border/40 rounded-lg p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">menu_book</span>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-muted-foreground">Articles Read</p>
                  <div className="flex items-baseline gap-2">
                    <p className="font-display-lg text-[32px] leading-10 text-foreground mt-1">{articlesReadCount}</p>
                    {articlesReadCount === 0 && (
                      <span className="text-[11px] text-muted-foreground">Start reading to see your stats here</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-background border border-border/40 rounded-lg p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>bookmark</span>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-muted-foreground">Articles Saved</p>
                  <p className="font-display-lg text-[32px] leading-10 text-foreground mt-1">{savedArticlesCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

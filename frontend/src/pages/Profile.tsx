import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { newsApi } from '@/api/newsApi';

export default function Profile() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [savedArticlesCount, setSavedArticlesCount] = useState(0);

  useEffect(() => {
    if (user) {
      newsApi.getSavedArticles(0, 1)
        .then(data => setSavedArticlesCount(data.totalElements || 0))
        .catch(err => console.error("Failed to fetch saved articles count", err));
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="pb-12 max-w-max_content_width mx-auto">
      <div className="mb-stack_lg border-b border-border/30 pb-8 mt-8 md:mt-0">
        <h2 className="font-display-lg text-[40px] leading-[48px] text-foreground tracking-tight mb-2">Profile Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account details and reading preferences.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: Avatar & Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-card rounded-xl shadow-premium p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full bg-primary/15 text-primary flex items-center justify-center text-3xl font-bold uppercase">
                {user.name.charAt(0)}
              </div>
            </div>
            <h3 className="font-headline-md text-headline-md text-foreground">{user.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
            <p className="text-[11px] font-semibold text-primary bg-primary/10 px-3 py-1 rounded-md mb-6 uppercase tracking-wider">{user.role}</p>
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
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted border border-border/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-muted-foreground transition-transform"></span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Column: Details & Insights */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-card rounded-xl shadow-premium p-6 md:p-8">
            <h3 className="font-headline-md text-headline-md text-foreground mb-6">Account Details</h3>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-muted-foreground">Full Name</label>
                <input 
                  className="border border-border/60 rounded-lg p-3 text-sm bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-foreground" 
                  type="text" 
                  defaultValue={user.name}
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-muted-foreground">Email Address</label>
                <input 
                  className="border border-border/60 rounded-lg p-3 text-sm bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-foreground" 
                  type="email" 
                  defaultValue={user.email}
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-muted-foreground">Bio (Optional)</label>
                <textarea 
                  className="border border-border/60 rounded-lg p-3 text-sm bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all resize-none text-foreground" 
                  rows={3}
                  defaultValue="Avid reader of technology and business news."
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end">
                <button 
                  className="text-sm font-medium bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50" 
                  type="button"
                  disabled
                >
                  Save Changes
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
                  <p className="font-display-lg text-[32px] leading-10 text-foreground mt-1">0</p>
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
    </div>
  );
}

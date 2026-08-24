import { useEffect, useState } from 'react';
import { adminApi } from '@/api/adminApi';

export default function SystemSettings() {
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await adminApi.getSettings();
      setSettings(data);
    } catch (e) {
      console.error(e);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    await adminApi.updateSetting(key, value);
    fetchSettings();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
      <div className="bg-card rounded-xl shadow-premium overflow-hidden">
        <div className="p-6 border-b border-border/30 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Configuration</h2>
          <button onClick={() => {
            const key = prompt("Setting key");
            const val = prompt("Setting value");
            if (key && val) updateSetting(key, val);
          }} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Setting
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/30 bg-muted/50">
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Key</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {settings.map(s => (
                <tr key={s.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-foreground font-mono text-[13px] font-medium">{s.settingKey}</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-[13px]">{s.settingValue}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => {
                      const val = prompt(`New value for ${s.settingKey}`, s.settingValue);
                      if (val) updateSetting(s.settingKey, val);
                    }} className="text-primary hover:text-primary/80 text-sm font-medium transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                    </button>
                  </td>
                </tr>
              ))}
              {settings.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                    No settings configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-premium overflow-hidden mt-6">
        <div className="p-6 border-b border-border/30">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">cleaning_services</span>
            Cache Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manually evict items from the Redis cache to ensure data freshness.
          </p>
        </div>
        <div className="p-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <label className="text-sm font-medium mb-1 block">Cache Scope</label>
              <select 
                className="w-full bg-background border border-border rounded-lg p-2"
                id="cache-scope"
              >
                <option value="ALL">Entire Cache (ALL)</option>
                <option value="HOMEPAGE">Homepage (Trending/Latest)</option>
                <option value="CATEGORY">Category Articles</option>
                <option value="SEARCH">Search Results</option>
              </select>
            </div>
            <button 
              onClick={async () => {
                const select = document.getElementById('cache-scope') as HTMLSelectElement;
                if (!select) return;
                const scope = select.value;
                if (!window.confirm(`Are you sure you want to clear the ${scope} cache?`)) return;
                
                try {
                  await adminApi.clearCache(scope);
                  alert('Cache cleared successfully!');
                } catch (e) {
                  alert('Failed to clear cache');
                }
              }}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

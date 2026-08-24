import { useState, useEffect } from 'react';
import { adminApi } from '@/api/adminApi';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface Source {
  id: number;
  provider: string;
  name: string;
  endpoint: string;
  status: string;
  apiKey?: string;
}

export default function SourceManagement() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSource, setCurrentSource] = useState<Partial<Source>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSources(0, 100); // Assuming small number of sources for now
      setSources(data.content || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch sources',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (currentSource.id) {
        await adminApi.updateSource(currentSource.id, currentSource);
        toast({ title: 'Success', description: 'Source updated successfully' });
      } else {
        await adminApi.createSource(currentSource);
        toast({ title: 'Success', description: 'Source created successfully' });
      }
      setIsEditing(false);
      setCurrentSource({});
      fetchSources();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save source',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to disable this source?')) return;
    try {
      await adminApi.deleteSource(id);
      toast({ title: 'Success', description: 'Source disabled successfully' });
      fetchSources();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disable source',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-max_content_width mx-auto w-full flex-grow flex flex-col gap-gutter pb-12 mt-8 md:mt-0">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="font-display-lg text-[32px] font-bold text-foreground">Source Management</h1>
          <p className="text-sm text-muted-foreground">Manage news ingestion sources</p>
        </div>
        <Button onClick={() => { setIsEditing(true); setCurrentSource({ status: 'ACTIVE' }); }}>
          <span className="material-symbols-outlined mr-2">add</span> Add Source
        </Button>
      </div>

      {isEditing && (
        <div className="bg-card rounded-xl p-6 shadow-premium mb-6 border border-border">
          <h3 className="text-lg font-bold mb-4">{currentSource.id ? 'Edit Source' : 'New Source'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <input 
                type="text" 
                className="w-full bg-background border border-border rounded-lg p-2"
                value={currentSource.name || ''}
                onChange={e => setCurrentSource({...currentSource, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Provider</label>
              <select 
                className="w-full bg-background border border-border rounded-lg p-2"
                value={currentSource.provider || ''}
                onChange={e => setCurrentSource({...currentSource, provider: e.target.value})}
              >
                <option value="">Select Provider</option>
                <option value="NEWSAPI">NewsAPI</option>
                <option value="NEWSDATA">NewsData.io</option>
                <option value="MEDIASTACK">Mediastack</option>
                <option value="GNEWS">GNews</option>
                <option value="RSS">RSS Feed</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Endpoint URL</label>
              <input 
                type="text" 
                className="w-full bg-background border border-border rounded-lg p-2"
                value={currentSource.endpoint || ''}
                onChange={e => setCurrentSource({...currentSource, endpoint: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">API Key (Leave blank to keep existing)</label>
              <input 
                type="password" 
                className="w-full bg-background border border-border rounded-lg p-2"
                onChange={e => setCurrentSource({...currentSource, apiKey: e.target.value})}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Source</Button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl shadow-premium overflow-hidden border border-border">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">ID</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Provider</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sources.map(source => (
                  <tr key={source.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm">{source.id}</td>
                    <td className="p-4 text-sm font-medium">{source.name}</td>
                    <td className="p-4 text-sm">{source.provider}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${source.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'}`}>
                        {source.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setCurrentSource(source); setIsEditing(true); }}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(source.id)} disabled={source.status === 'DISABLED'}>
                        Disable
                      </Button>
                    </td>
                  </tr>
                ))}
                {sources.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No sources found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Plus, Edit2, Trash2, Search, Filter,
  CheckCircle2, XCircle, MoreVertical, Loader2, Link2, Clock, Code,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '@/hooks/use-toast';

interface Source {
  id: number;
  provider: string;
  name: string;
  endpoint: string;
  status: string;
  apiKey?: string;
  url?: string;
  scrapingFrequency?: number;
  parserType?: string;
  lastScrapedTime?: string;
  lastScrapeStatus?: string;
  totalArticlesScraped?: number;
}

export default function SourceManagement() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSource, setCurrentSource] = useState<Partial<Source>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSources(0, 100);
      setSources(data.content || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sources');
      toast({
        title: 'Error',
        description: 'Failed to fetch sources',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (source?: Source) => {
    if (source) {
      setIsEditing(true);
      setCurrentSource(source);
    } else {
      setIsEditing(false);
      setCurrentSource({ 
        status: 'ACTIVE', 
        scrapingFrequency: 60,
        parserType: 'RSS' 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSource({});
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing && currentSource.id) {
        await adminApi.updateSource(currentSource.id, currentSource);
        toast({ title: 'Success', description: 'Source updated successfully' });
      } else {
        await adminApi.createSource(currentSource);
        toast({ title: 'Success', description: 'Source created successfully' });
      }
      handleCloseModal();
      fetchSources();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save source');
      toast({
        title: 'Error',
        description: 'Failed to save source',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to disable this source?')) {
      try {
        await adminApi.deleteSource(id);
        toast({ title: 'Success', description: 'Source disabled successfully' });
        fetchSources();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to disable source');
        toast({
          title: 'Error',
          description: 'Failed to disable source',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading && sources.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-primary/50 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 pt-24 overflow-y-auto w-full">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-border/30 flex items-center justify-center backdrop-blur-md">
              <Database className="w-5 h-5 text-secondary-theme" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-primary-theme tracking-tight">Sources</h1>
              <p className="text-sm text-muted-theme font-medium">Manage news ingestion sources</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary-light border border-primary/30 rounded-xl transition-all duration-300 font-medium"
          >
            <Plus className="w-4 h-4" />
            New Source
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
            <XCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Data Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-border/30 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-semibold text-primary-theme/40 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-primary-theme/40 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-4 text-xs font-semibold text-primary-theme/40 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-primary-theme/40 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-4 text-xs font-semibold text-primary-theme/40 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-primary-theme/40 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sources.map((source) => (
                  <tr key={source.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-heading-theme">{source.name}</div>
                      <div className="text-xs text-primary-theme/40 font-mono mt-0.5 truncate max-w-[200px]">
                        {source.url || source.endpoint}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-[10px] font-medium bg-black/5 dark:bg-black/5 dark:bg-white/5 text-muted-theme rounded border border-border/30 uppercase tracking-wider">
                        {source.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-xs text-muted-theme">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {source.scrapingFrequency || 60}m
                        </div>
                        <div className="flex items-center gap-1">
                          <Code className="w-3.5 h-3.5" />
                          {source.parserType || 'RSS'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-muted-theme">
                        <div className="flex items-center gap-1">
                          <span className="text-primary-theme/40">Articles:</span>
                          <span className="text-secondary-theme font-medium">{source.totalArticlesScraped || 0}</span>
                        </div>
                        {source.lastScrapedTime && (
                          <div className="flex items-center gap-1">
                            <span className="text-primary-theme/40">Last Run:</span>
                            <span className="text-secondary-theme">{new Date(source.lastScrapedTime).toLocaleString()}</span>
                            {source.lastScrapeStatus === 'SUCCESS' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-1" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-400 ml-1" />
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {source.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle className="w-3.5 h-3.5" />
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(source)}
                          className="p-1.5 hover:bg-black/5 dark:bg-black/5 dark:bg-white/5 rounded-lg text-primary-theme/40 hover:text-heading-theme transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(source.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            source.status === 'DISABLED' 
                              ? 'text-primary-theme/20 cursor-not-allowed' 
                              : 'hover:bg-red-500/10 text-primary-theme/40 hover:text-red-400'
                          }`}
                          disabled={source.status === 'DISABLED'}
                          title="Disable"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sources.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-primary-theme/40 text-sm">
                      No sources found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-card rounded-2xl border border-border/30 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-white/5 bg-white/[0.02] sticky top-0 z-10 backdrop-blur-xl">
                <h2 className="text-xl font-serif font-bold text-primary-theme">
                  {isEditing ? 'Edit Source' : 'New Source'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-theme uppercase tracking-wider mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={currentSource.name || ''}
                      onChange={(e) => setCurrentSource({ ...currentSource, name: e.target.value })}
                      className="w-full bg-black/20 border border-border/30 rounded-xl px-4 py-2.5 text-primary-theme placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                      placeholder="e.g. TechCrunch AI"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-theme uppercase tracking-wider mb-2">
                      Provider
                    </label>
                    <select
                      required
                      value={currentSource.provider || ''}
                      onChange={(e) => setCurrentSource({ ...currentSource, provider: e.target.value })}
                      className="w-full bg-black/20 border border-border/30 rounded-xl px-4 py-2.5 text-primary-theme focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    >
                      <option value="" disabled className="text-black">Select Provider</option>
                      <option value="NEWSAPI" className="text-black">NewsAPI</option>
                      <option value="NEWSDATA" className="text-black">NewsData.io</option>
                      <option value="MEDIASTACK" className="text-black">Mediastack</option>
                      <option value="GNEWS" className="text-black">GNews</option>
                      <option value="RSS" className="text-black">RSS Feed</option>
                      <option value="SCRAPER" className="text-black">HTML Scraper</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-theme uppercase tracking-wider mb-2">
                    Source URL
                  </label>
                  <input
                    type="url"
                    value={currentSource.url || ''}
                    onChange={(e) => setCurrentSource({ ...currentSource, url: e.target.value })}
                    className="w-full bg-black/20 border border-border/30 rounded-xl px-4 py-2.5 text-primary-theme placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    placeholder="e.g. https://techcrunch.com/category/artificial-intelligence/"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-muted-theme uppercase tracking-wider mb-2">
                    Endpoint / API URL (Internal)
                  </label>
                  <input
                    type="text"
                    required
                    value={currentSource.endpoint || ''}
                    onChange={(e) => setCurrentSource({ ...currentSource, endpoint: e.target.value })}
                    className="w-full bg-black/20 border border-border/30 rounded-xl px-4 py-2.5 text-primary-theme placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm font-mono"
                    placeholder="e.g. https://newsapi.org/v2/everything?q=AI"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-theme uppercase tracking-wider mb-2">
                    API Key (Leave blank to keep existing)
                  </label>
                  <input
                    type="password"
                    value={currentSource.apiKey || ''}
                    onChange={(e) => setCurrentSource({ ...currentSource, apiKey: e.target.value })}
                    className="w-full bg-black/20 border border-border/30 rounded-xl px-4 py-2.5 text-primary-theme placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    placeholder="Enter new API key if needed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-theme uppercase tracking-wider mb-2">
                      Scraping Frequency (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      value={currentSource.scrapingFrequency || 60}
                      onChange={(e) => setCurrentSource({ ...currentSource, scrapingFrequency: parseInt(e.target.value) })}
                      className="w-full bg-black/20 border border-border/30 rounded-xl px-4 py-2.5 text-primary-theme placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                      placeholder="e.g. 60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-theme uppercase tracking-wider mb-2">
                      Parser Type
                    </label>
                    <select
                      value={currentSource.parserType || 'RSS'}
                      onChange={(e) => setCurrentSource({ ...currentSource, parserType: e.target.value })}
                      className="w-full bg-black/20 border border-border/30 rounded-xl px-4 py-2.5 text-primary-theme focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    >
                      <option value="RSS" className="text-black">RSS</option>
                      <option value="JSON_API" className="text-black">JSON API</option>
                      <option value="HTML" className="text-black">HTML (Web Scrape)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="status"
                    checked={currentSource.status === 'ACTIVE'}
                    onChange={(e) => setCurrentSource({ 
                      ...currentSource, 
                      status: e.target.checked ? 'ACTIVE' : 'DISABLED' 
                    })}
                    className="w-4 h-4 rounded border-border/50 bg-black/20 text-primary focus:ring-primary/50 focus:ring-offset-0"
                  />
                  <label htmlFor="status" className="text-sm font-medium text-secondary-theme">
                    Active (source will be polled)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-muted-theme hover:text-primary-theme bg-black/5 dark:bg-white/5 hover:bg-black/5 dark:bg-black/5 dark:bg-white/5 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-black bg-white hover:bg-white/90 rounded-xl transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Save Source'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

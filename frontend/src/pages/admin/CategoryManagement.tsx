import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderTree, Plus, Edit2, Trash2, Search, Filter,
  CheckCircle2, XCircle, MoreVertical, Loader2, ArrowUpRight, Hash, HashIcon, Eye
} from 'lucide-react';
import { adminApi } from '@/api/adminApi';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: number;
  title: string;
  slug: string;
  icon: string;
  active: boolean;
  keywords?: string;
  displayOrder?: number;
  articleCount?: number;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCategories();
      // sort by display order ascending
      const sortedData = [...(data || [])].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setCategories(sortedData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
      toast({
        title: 'Error',
        description: 'Failed to fetch categories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setIsEditing(true);
      setCurrentCategory(category);
    } else {
      setIsEditing(false);
      setCurrentCategory({ active: true, displayOrder: 0 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCategory({});
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing && currentCategory.id) {
        await adminApi.updateCategory(currentCategory.id, currentCategory);
        toast({ title: 'Success', description: 'Category updated successfully' });
      } else {
        await adminApi.createCategory(currentCategory);
        toast({ title: 'Success', description: 'Category created successfully' });
      }
      handleCloseModal();
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
      toast({
        title: 'Error',
        description: 'Failed to save category',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminApi.deleteCategory(id);
        toast({ title: 'Success', description: 'Category deleted successfully' });
        fetchCategories();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete category');
        toast({
          title: 'Error',
          description: 'Failed to delete category',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading && categories.length === 0) {
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
              <FolderTree className="w-5 h-5 text-secondary-theme" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-primary-theme tracking-tight">Categories</h1>
              <p className="text-sm text-muted-theme font-medium">Organize and tag your content platform</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary-light border border-primary/30 rounded-xl transition-all duration-300 font-medium"
          >
            <Plus className="w-4 h-4" />
            New Category
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
                  <th className="px-6 py-4 text-xs font-semibold text-primary-theme/40 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-xs font-semibold text-primary-theme/40 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-primary-theme/40 uppercase tracking-wider">Keywords</th>
                  <th className="px-6 py-4 text-xs font-semibold text-primary-theme/40 uppercase tracking-wider">Articles</th>
                  <th className="px-6 py-4 text-xs font-semibold text-primary-theme/40 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-primary-theme/40 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-muted-theme">
                      {cat.displayOrder ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center border border-border/30">
                          {cat.icon ? (
                            <span className="material-icons text-sm text-secondary-theme">{cat.icon}</span>
                          ) : (
                            <Hash className="w-4 h-4 text-primary-theme/40" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-heading-theme">{cat.title}</div>
                          <div className="text-xs text-primary-theme/40 font-mono mt-0.5">/{cat.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {cat.keywords ? cat.keywords.split(',').map((k, i) => (
                          <span key={i} className="px-1.5 py-0.5 text-[10px] font-medium bg-black/5 dark:bg-black/5 dark:bg-white/5 text-muted-theme rounded border border-border/30 uppercase tracking-wider">
                            {k.trim()}
                          </span>
                        )) : <span className="text-primary-theme/30 text-xs italic">No keywords</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-black/5 dark:bg-black/5 dark:bg-white/5 text-secondary-theme border border-border/50">
                        {cat.articleCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {cat.active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle className="w-3.5 h-3.5" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          className="p-1.5 hover:bg-black/5 dark:bg-black/5 dark:bg-white/5 rounded-lg text-primary-theme/40 hover:text-heading-theme transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-primary-theme/40 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              className="relative w-full max-w-md glass-card rounded-2xl border border-border/30 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <h2 className="text-xl font-serif font-bold text-primary-theme">
                  {isEditing ? 'Edit Category' : 'New Category'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-theme uppercase tracking-wider mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={currentCategory.title || ''}
                    onChange={(e) => setCurrentCategory({ ...currentCategory, title: e.target.value })}
                    className="w-full bg-black/20 border border-border/30 rounded-xl px-4 py-2.5 text-primary-theme placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    placeholder="e.g. Artificial Intelligence"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-theme uppercase tracking-wider mb-2">
                    Slug (optional)
                  </label>
                  <input
                    type="text"
                    value={currentCategory.slug || ''}
                    onChange={(e) => setCurrentCategory({ ...currentCategory, slug: e.target.value })}
                    className="w-full bg-black/20 border border-border/30 rounded-xl px-4 py-2.5 text-primary-theme placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm font-mono"
                    placeholder="e.g. ai-news"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-theme uppercase tracking-wider mb-2">
                    Icon Name (optional)
                  </label>
                  <input
                    type="text"
                    value={currentCategory.icon || ''}
                    onChange={(e) => setCurrentCategory({ ...currentCategory, icon: e.target.value })}
                    className="w-full bg-black/20 border border-border/30 rounded-xl px-4 py-2.5 text-primary-theme placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    placeholder="e.g. smart_toy"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-muted-theme uppercase tracking-wider mb-2">
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    value={currentCategory.keywords || ''}
                    onChange={(e) => setCurrentCategory({ ...currentCategory, keywords: e.target.value })}
                    className="w-full bg-black/20 border border-border/30 rounded-xl px-4 py-2.5 text-primary-theme placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    placeholder="e.g. ML, NLP, Neural Networks"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-muted-theme uppercase tracking-wider mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={currentCategory.displayOrder || 0}
                    onChange={(e) => setCurrentCategory({ ...currentCategory, displayOrder: parseInt(e.target.value) })}
                    className="w-full bg-black/20 border border-border/30 rounded-xl px-4 py-2.5 text-primary-theme placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    placeholder="e.g. 1"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={currentCategory.active ?? true}
                    onChange={(e) => setCurrentCategory({ ...currentCategory, active: e.target.checked })}
                    className="w-4 h-4 rounded border-border/50 bg-black/20 text-primary focus:ring-primary/50 focus:ring-offset-0"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-secondary-theme">
                    Active (visible to users)
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
                      'Save Category'
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

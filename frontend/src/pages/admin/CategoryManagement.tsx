import { useState, useEffect } from 'react';
import { adminApi } from '@/api/adminApi';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface Category {
  id: number;
  title: string;
  slug: string;
  icon: string;
  active: boolean;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCategories();
      setCategories(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch categories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (currentCategory.id) {
        await adminApi.updateCategory(currentCategory.id, currentCategory);
        toast({ title: 'Success', description: 'Category updated successfully' });
      } else {
        await adminApi.createCategory(currentCategory);
        toast({ title: 'Success', description: 'Category created successfully' });
      }
      setIsEditing(false);
      setCurrentCategory({});
      fetchCategories();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save category',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await adminApi.deleteCategory(id);
      toast({ title: 'Success', description: 'Category deleted successfully' });
      fetchCategories();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-max_content_width mx-auto w-full flex-grow flex flex-col gap-gutter pb-12 mt-8 md:mt-0">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="font-display-lg text-[32px] font-bold text-foreground">Category Management</h1>
          <p className="text-sm text-muted-foreground">Manage article categories</p>
        </div>
        <Button onClick={() => { setIsEditing(true); setCurrentCategory({ active: true }); }}>
          <span className="material-symbols-outlined mr-2">add</span> Add Category
        </Button>
      </div>

      {isEditing && (
        <div className="bg-card rounded-xl p-6 shadow-premium mb-6 border border-border">
          <h3 className="text-lg font-bold mb-4">{currentCategory.id ? 'Edit Category' : 'New Category'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <input 
                type="text" 
                className="w-full bg-background border border-border rounded-lg p-2"
                value={currentCategory.title || ''}
                onChange={e => setCurrentCategory({...currentCategory, title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Slug</label>
              <input 
                type="text" 
                className="w-full bg-background border border-border rounded-lg p-2"
                value={currentCategory.slug || ''}
                onChange={e => setCurrentCategory({...currentCategory, slug: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Icon (Material Symbol)</label>
              <input 
                type="text" 
                className="w-full bg-background border border-border rounded-lg p-2"
                value={currentCategory.icon || ''}
                onChange={e => setCurrentCategory({...currentCategory, icon: e.target.value})}
              />
            </div>
            <div className="flex items-center mt-6">
              <label className="text-sm font-medium flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mr-2 h-4 w-4"
                  checked={currentCategory.active ?? true}
                  onChange={e => setCurrentCategory({...currentCategory, active: e.target.checked})}
                />
                Active
              </label>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Category</Button>
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
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Icon</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Title</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Slug</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map(category => (
                  <tr key={category.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <span className="material-symbols-outlined text-muted-foreground">{category.icon}</span>
                    </td>
                    <td className="p-4 text-sm font-medium">{category.title}</td>
                    <td className="p-4 text-sm text-muted-foreground">{category.slug}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${category.active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                        {category.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setCurrentCategory(category); setIsEditing(true); }}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No categories found.
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

import axiosClient from './axiosClient';

export interface Category {
  id: number;
  title: string;
  slug: string;
  icon: string | null;
  active: boolean;
}

export const categoryApi = {
  getAllCategories: async (): Promise<Category[]> => {
    // Note: Gateway maps /api/categories directly to category-service
    // but the backend returns a PagedResponse, so we return the content array.
    const response = await axiosClient.get<{ content: Category[] }>('/categories?size=100');
    return response.data.content;
  },
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await axiosClient.get<Category>(`/categories/slug/${slug}`);
    return response.data;
  }
};

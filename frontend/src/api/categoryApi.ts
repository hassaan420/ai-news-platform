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
    // The backend returns a List, so we just return response.data
    const response = await axiosClient.get<Category[]>('/categories');
    return response.data;
  },
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await axiosClient.get<Category>(`/categories/${slug}`);
    return response.data;
  }
};

import axiosClient from './axiosClient';
import { Article, PagedResponse } from '../types/news';


export const newsApi = {
  getLatestNews: async (page = 0, size = 10, dateFilter?: string, from?: string, to?: string): Promise<PagedResponse<Article>> => {
    let url = `/news/latest?page=${page}&size=${size}`;
    if (dateFilter) url += `&dateFilter=${dateFilter}`;
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;
    const response = await axiosClient.get<PagedResponse<Article>>(url);
    return response.data;
  },

  getTrendingNews: async (page = 0, size = 10): Promise<PagedResponse<Article>> => {
    const response = await axiosClient.get<PagedResponse<Article>>(`/news/trending?page=${page}&size=${size}`);
    return response.data;
  },

  getNewsByCategory: async (category: string, page = 0, size = 10): Promise<PagedResponse<Article>> => {
    const response = await axiosClient.get<PagedResponse<Article>>(`/news/category/${category}?page=${page}&size=${size}`);
    return response.data;
  },

  getCategoryMetrics: async (category: string): Promise<any> => {
    const response = await axiosClient.get<any>(`/news/category/${category}/metrics`);
    return response.data;
  },

  getTrendingNewsByCategory: async (category: string, page = 0, size = 10): Promise<PagedResponse<Article>> => {
    const response = await axiosClient.get<PagedResponse<Article>>(`/news/category/${category}/trending?page=${page}&size=${size}`);
    return response.data;
  },

  getNewsById: async (id: number): Promise<Article> => {
    const response = await axiosClient.get<Article>(`/news/${id}`);
    return response.data;
  },

  searchNews: async (query: string, page = 0, size = 10): Promise<PagedResponse<Article>> => {
    const response = await axiosClient.get<PagedResponse<Article>>(`/news/ai/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
    return response.data;
  },

  getSavedArticles: async (page = 0, size = 10): Promise<PagedResponse<Article>> => {
    const response = await axiosClient.get<PagedResponse<Article>>(`/news/saved?page=${page}&size=${size}`);
    return response.data;
  },

  getReadingCount: async (): Promise<{ articlesRead: number }> => {
    const response = await axiosClient.get<{ articlesRead: number }>('/news/me/reading-count');
    return response.data;
  },

  recordArticleRead: async (id: number): Promise<void> => {
    await axiosClient.post(`/news/me/history/${id}`);
  },

  saveArticle: async (id: number): Promise<void> => {
    await axiosClient.post(`/news/${id}/save`);
  },

  unsaveArticle: async (id: number): Promise<void> => {
    await axiosClient.delete(`/news/${id}/save`);
  },

  getRelatedArticles: async (id: number): Promise<Article[]> => {
    const response = await axiosClient.get<Article[]>(`/news/ai/${id}/related`);
    return response.data;
  },

  getPersonalizedFeed: async (): Promise<Article[]> => {
    const response = await axiosClient.get<Article[]>(`/news/ai/personalized`);
    return response.data;
  },

  getTrendingAiNews: async (): Promise<Article[]> => {
    const response = await axiosClient.get<Article[]>(`/news/ai/trending`);
    return response.data;
  },

  getArticleVerification: async (id: number): Promise<import('../types/news').ArticleVerificationDto> => {
    const response = await axiosClient.get<import('../types/news').ArticleVerificationDto>(`/news/${id}/verification`);
    return response.data;
  }
};

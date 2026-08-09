import axiosClient from './axiosClient';

export interface ChartDataPoint {
  name: string;
  users: number;
  articles: number;
}

export interface ActivityItem {
  title: string;
  desc: string;
  time: string;
}

export interface AiStats {
  aiTasksPending?: number;
  aiTasksCompleted?: number;
  aiTasksFailed?: number;
  avgAiConfidence?: number;
  avgProcessingTimeMs?: number;
}

export interface AdminStats {
  totalUsers: number;
  totalArticles: number;
  activeSessions: number;
  systemHealth: string;
  chartData: ChartDataPoint[];
  recentActivity: ActivityItem[];
  aiStats?: AiStats;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await axiosClient.get<AdminStats>('/admin/dashboard/stats');
    return response.data;
  },
  
  // Users
  getUsers: async () => {
    const response = await axiosClient.get('/admin/users');
    return response.data;
  },
  updateUserRole: async (id: number, role: string) => {
    const response = await axiosClient.put(`/admin/users/${id}/role?role=${role}`);
    return response.data;
  },
  updateUserStatus: async (id: number, enabled: boolean) => {
    const response = await axiosClient.put(`/admin/users/${id}/status?enabled=${enabled}`);
    return response.data;
  },
  deleteUser: async (id: number) => {
    const response = await axiosClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Articles
  getArticles: async (page = 0, size = 20) => {
    const response = await axiosClient.get(`/admin/articles?page=${page}&size=${size}`);
    return response.data;
  },
  featureArticle: async (id: number, featured: boolean) => {
    const response = await axiosClient.put(`/admin/articles/${id}/feature?featured=${featured}`);
    return response.data;
  },
  hideArticle: async (id: number, hidden: boolean) => {
    const response = await axiosClient.put(`/admin/articles/${id}/hide?hidden=${hidden}`);
    return response.data;
  },
  deleteArticle: async (id: number) => {
    const response = await axiosClient.delete(`/admin/articles/${id}`);
    return response.data;
  },

  // System
  getHealth: async () => {
    const response = await axiosClient.get('/admin/system/health');
    return response.data;
  },
  getSettings: async () => {
    const response = await axiosClient.get('/admin/system/settings');
    return response.data;
  },
  updateSetting: async (key: string, value: string) => {
    const response = await axiosClient.put(`/admin/system/settings?key=${key}&value=${value}`);
    return response.data;
  },
  triggerScheduler: async () => {
    const response = await axiosClient.post('/admin/system/scheduler/trigger');
    return response.data;
  },
  getAuditLogs: async (page = 0, size = 20) => {
    const response = await axiosClient.get(`/admin/system/audit-logs?page=${page}&size=${size}`);
    return response.data;
  },
  getErrorLogs: async (page = 0, size = 20) => {
    const response = await axiosClient.get(`/admin/system/error-logs?page=${page}&size=${size}`);
    return response.data;
  }
};

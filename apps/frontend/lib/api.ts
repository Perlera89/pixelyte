import { api } from "@/routes/api";

export const adminApi = {
  getDashboardMetrics: async () => {
    try {
      const response = await api.get("/admin/dashboard/metrics", {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in getDashboardMetrics:', error);
      throw error;
    }
  },
};

export default api;

import { User } from "@/types";
import { api } from "./api";

export const authApi = {
  register: async (user: Partial<User>) => {
    const response = await api.post("/auth/register", {
      email: user.email,
      password: user.password,
      names: user.names,
      surnames: user.surnames,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
    });
    return response.data;
  },

  login: async (user: { email: string; password: string }) => {
    const response = await api.post("/auth/login", {
      email: user.email,
      password: user.password,
    });

    return response.data;
  },

  validateToken: async (token: string) => {
    const response = await api.get("/auth/validate", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post("/auth/refresh", {
      refreshToken,
    });

    return response.data;
  },
};

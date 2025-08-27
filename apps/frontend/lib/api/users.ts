import { api } from "@/routes/api";
import { User } from "@/types";

export interface UserProfile {
  id: string;
  names: string;
  surnames: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  names?: string;
  surnames?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface CreateAddressDto {
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export const usersApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileDto): Promise<UserProfile> => {
    const response = await api.put("/users/profile", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordDto): Promise<void> => {
    await api.put("/users/password", data);
  },

  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get("/users/addresses");
    return response.data;
  },

  createAddress: async (data: CreateAddressDto): Promise<Address> => {
    const response = await api.post("/users/addresses", data);
    return response.data;
  },

  updateAddress: async (
    id: string,
    data: Partial<CreateAddressDto>
  ): Promise<Address> => {
    const response = await api.put(`/users/addresses/${id}`, data);
    return response.data;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await api.delete(`/users/addresses/${id}`);
  },
};

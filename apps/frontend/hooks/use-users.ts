import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  usersApi,
  UpdateProfileDto,
  ChangePasswordDto,
  CreateAddressDto,
} from "@/lib/api/users";
import { useErrorHandler } from "@/lib/api/error-handler";
import { toast } from "sonner";

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: usersApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: usersApi.updateProfile,
    onError: (error) => {
      handleError(error);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user", "profile"], data);
      toast.success("Perfil actualizado exitosamente");
    },
  });
};

export const useChangePassword = () => {
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: usersApi.changePassword,
    onError: (error) => {
      handleError(error);
    },
    onSuccess: () => {
      toast.success("Contraseña cambiada exitosamente");
    },
  });
};

export const useUserAddresses = () => {
  return useQuery({
    queryKey: ["user", "addresses"],
    queryFn: usersApi.getAddresses,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: usersApi.createAddress,
    onError: (error) => {
      handleError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "addresses"] });
      toast.success("Dirección creada exitosamente");
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateAddressDto>;
    }) => usersApi.updateAddress(id, data),
    onError: (error) => {
      handleError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "addresses"] });
      toast.success("Dirección actualizada exitosamente");
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: usersApi.deleteAddress,
    onError: (error) => {
      handleError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "addresses"] });
      toast.success("Dirección eliminada exitosamente");
    },
  });
};

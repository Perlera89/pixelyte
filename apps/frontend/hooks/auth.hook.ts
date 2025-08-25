import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User } from "@/types";

export function useAuth(
  registerFn?: (user: Partial<User>) => Promise<void>,
  loginFn?: (user: Partial<User>) => Promise<void>
) {
  const router = useRouter();

  const registerMutation = useMutation({
    mutationFn: registerFn!,
    onSuccess: () => {
      router.push("/login");
      toast.success("Registro exitoso");
    },
    onError: (error) => {
      const errorMessage =
        (error as any)?.response?.data?.message || "Error desconocido";
      toast.error("Error al crear la cuenta", {
        description: errorMessage,
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginFn!,
    onSuccess: () => {
      toast.success("Inicio de sesión exitoso");
      router.push("/");
    },
    onError: (error) => {
      console.error(error);
      const errorMessage =
        (error as any)?.response?.data?.message || "Error desconocido";
      toast.error("Error al iniciar sesión", {
        description: errorMessage,
      });
    },
  });

  return {
    register: (user: Partial<User>) => registerMutation.mutate(user),
    login: (user: Partial<User>) => loginMutation.mutate(user),

    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,

    registerError: registerMutation.error,
    loginError: loginMutation.error,
  };
}

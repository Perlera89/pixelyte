import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Correo electrónico inválido")
    .min(1, "El correo es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const registerSchema = z
  .object({
    names: z.string().min(1, "El nombre es requerido"),
    surnames: z.string().min(1, "El apellido es requerido"),
    email: z
      .string()
      .email("Correo electrónico inválido")
      .min(1, "El correo es requerido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "La contraseña debe contener al menos una letra mayúscula, una minúscula y un número"
      ),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    birthdate: z.string().min(1, "La fecha de nacimiento es requerida"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

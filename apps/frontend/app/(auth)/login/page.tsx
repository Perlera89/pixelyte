"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LaptopMinimal, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/auth.hook";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { user, login } = useAuthStore();
  const { login: loginAction, isLoggingIn } = useAuth(undefined, login);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user?.isAuthenticated) {
      console.log("Authenticated");
      router.push("/");
    }
  }, [user?.isAuthenticated, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginAction(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">
                <LaptopMinimal className="h-4 w-4" />
              </span>
            </div>
            <span className="font-bold text-xl text-foreground">Pixelyte</span>
          </Link>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold font-sans">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-sm">
              Accede a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {form.formState.errors.email && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {form.formState.errors.email.message}
                    </AlertDescription>
                  </Alert>
                )}
                {form.formState.errors.password && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {form.formState.errors.password.message}
                    </AlertDescription>
                  </Alert>
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="correo@ejemplo.com"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="h-10 pr-10"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          className="absolute right-2 top-1/2 -translate-y-1/2 hover:text-gray-100"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
              </form>
            </Form>
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link
                  href="/register"
                  className="text-primary hover:underline font-medium"
                >
                  Crear cuenta
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

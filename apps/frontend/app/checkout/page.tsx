"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  CreditCard,
  Truck,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { cn } from "@/lib/utils";

type CheckoutStep = "shipping" | "payment" | "confirmation";

interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [shippingData, setShippingData] = useState<ShippingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "México",
  });

  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });

  const [shippingErrors, setShippingErrors] = useState<Partial<ShippingData>>(
    {}
  );
  const [paymentErrors, setPaymentErrors] = useState<Partial<PaymentData>>({});

  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { items, getTotalPrice, clearCart } = useCartStore();

  const subtotal = getTotalPrice();
  const shipping = subtotal > 100 ? 0 : 15.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    // Pre-fill user data
    if (user) {
      setShippingData((prev) => ({
        ...prev,
        firstName: user.name.split(" ")[0] || "",
        lastName: user.name.split(" ").slice(1).join(" ") || "",
        email: user.email,
      }));
    }
  }, [isAuthenticated, items.length, router, user]);

  const validateShipping = (): boolean => {
    const errors: Partial<ShippingData> = {};

    if (!shippingData.firstName.trim()) errors.firstName = "Nombre requerido";
    if (!shippingData.lastName.trim()) errors.lastName = "Apellido requerido";
    if (!shippingData.email.trim()) errors.email = "Email requerido";
    if (!shippingData.phone.trim()) errors.phone = "Teléfono requerido";
    if (!shippingData.address.trim()) errors.address = "Dirección requerida";
    if (!shippingData.city.trim()) errors.city = "Ciudad requerida";
    if (!shippingData.state.trim()) errors.state = "Estado requerido";
    if (!shippingData.zipCode.trim())
      errors.zipCode = "Código postal requerido";

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePayment = (): boolean => {
    const errors: Partial<PaymentData> = {};

    if (!paymentData.cardNumber.trim())
      errors.cardNumber = "Número de tarjeta requerido";
    else if (paymentData.cardNumber.replace(/\s/g, "").length !== 16)
      errors.cardNumber = "Número de tarjeta inválido";

    if (!paymentData.expiryDate.trim())
      errors.expiryDate = "Fecha de vencimiento requerida";
    if (!paymentData.cvv.trim()) errors.cvv = "CVV requerido";
    else if (paymentData.cvv.length !== 3)
      errors.cvv = "CVV debe tener 3 dígitos";

    if (!paymentData.cardName.trim())
      errors.cardName = "Nombre en la tarjeta requerido";

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setCurrentStep("payment");
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePayment()) return;

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Generate order ID
    const newOrderId = `ORD-${Date.now()}`;
    setOrderId(newOrderId);

    // Clear cart and move to confirmation
    clearCart();
    setIsProcessing(false);
    setCurrentStep("confirmation");
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  if (!isAuthenticated || items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground font-sans mb-4">
              Cargando...
            </h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  currentStep === "shipping"
                    ? "bg-primary text-primary-foreground"
                    : currentStep === "payment" ||
                        currentStep === "confirmation"
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep === "payment" || currentStep === "confirmation" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Truck className="h-4 w-4" />
                )}
              </div>
              <span className="font-semibold">Envío</span>
            </div>

            <div className="flex-1 h-px bg-border" />

            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  currentStep === "payment"
                    ? "bg-primary text-primary-foreground"
                    : currentStep === "confirmation"
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep === "confirmation" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
              </div>
              <span className="font-semibold">Pago</span>
            </div>

            <div className="flex-1 h-px bg-border" />

            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  currentStep === "confirmation"
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="font-semibold">Confirmación</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === "shipping" && (
              <Card>
                <CardHeader>
                  <CardTitle>Información de Envío</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                          id="firstName"
                          value={shippingData.firstName}
                          onChange={(e) =>
                            setShippingData({
                              ...shippingData,
                              firstName: e.target.value,
                            })
                          }
                          className={
                            shippingErrors.firstName ? "border-destructive" : ""
                          }
                        />
                        {shippingErrors.firstName && (
                          <p className="text-sm text-destructive">
                            {shippingErrors.firstName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input
                          id="lastName"
                          value={shippingData.lastName}
                          onChange={(e) =>
                            setShippingData({
                              ...shippingData,
                              lastName: e.target.value,
                            })
                          }
                          className={
                            shippingErrors.lastName ? "border-destructive" : ""
                          }
                        />
                        {shippingErrors.lastName && (
                          <p className="text-sm text-destructive">
                            {shippingErrors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingData.email}
                          onChange={(e) =>
                            setShippingData({
                              ...shippingData,
                              email: e.target.value,
                            })
                          }
                          className={
                            shippingErrors.email ? "border-destructive" : ""
                          }
                        />
                        {shippingErrors.email && (
                          <p className="text-sm text-destructive">
                            {shippingErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          value={shippingData.phone}
                          onChange={(e) =>
                            setShippingData({
                              ...shippingData,
                              phone: e.target.value,
                            })
                          }
                          className={
                            shippingErrors.phone ? "border-destructive" : ""
                          }
                        />
                        {shippingErrors.phone && (
                          <p className="text-sm text-destructive">
                            {shippingErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={shippingData.address}
                        onChange={(e) =>
                          setShippingData({
                            ...shippingData,
                            address: e.target.value,
                          })
                        }
                        className={
                          shippingErrors.address ? "border-destructive" : ""
                        }
                      />
                      {shippingErrors.address && (
                        <p className="text-sm text-destructive">
                          {shippingErrors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Ciudad</Label>
                        <Input
                          id="city"
                          value={shippingData.city}
                          onChange={(e) =>
                            setShippingData({
                              ...shippingData,
                              city: e.target.value,
                            })
                          }
                          className={
                            shippingErrors.city ? "border-destructive" : ""
                          }
                        />
                        {shippingErrors.city && (
                          <p className="text-sm text-destructive">
                            {shippingErrors.city}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={shippingData.state}
                          onChange={(e) =>
                            setShippingData({
                              ...shippingData,
                              state: e.target.value,
                            })
                          }
                          className={
                            shippingErrors.state ? "border-destructive" : ""
                          }
                        />
                        {shippingErrors.state && (
                          <p className="text-sm text-destructive">
                            {shippingErrors.state}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zipCode">Código Postal</Label>
                        <Input
                          id="zipCode"
                          value={shippingData.zipCode}
                          onChange={(e) =>
                            setShippingData({
                              ...shippingData,
                              zipCode: e.target.value,
                            })
                          }
                          className={
                            shippingErrors.zipCode ? "border-destructive" : ""
                          }
                        />
                        {shippingErrors.zipCode && (
                          <p className="text-sm text-destructive">
                            {shippingErrors.zipCode}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      Continuar al Pago
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {currentStep === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle>Información de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            cardNumber: formatCardNumber(e.target.value),
                          })
                        }
                        maxLength={19}
                        className={
                          paymentErrors.cardNumber ? "border-destructive" : ""
                        }
                      />
                      {paymentErrors.cardNumber && (
                        <p className="text-sm text-destructive">
                          {paymentErrors.cardNumber}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/AA"
                          value={paymentData.expiryDate}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              expiryDate: formatExpiryDate(e.target.value),
                            })
                          }
                          maxLength={5}
                          className={
                            paymentErrors.expiryDate ? "border-destructive" : ""
                          }
                        />
                        {paymentErrors.expiryDate && (
                          <p className="text-sm text-destructive">
                            {paymentErrors.expiryDate}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              cvv: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          maxLength={3}
                          className={
                            paymentErrors.cvv ? "border-destructive" : ""
                          }
                        />
                        {paymentErrors.cvv && (
                          <p className="text-sm text-destructive">
                            {paymentErrors.cvv}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
                      <Input
                        id="cardName"
                        value={paymentData.cardName}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            cardName: e.target.value,
                          })
                        }
                        className={
                          paymentErrors.cardName ? "border-destructive" : ""
                        }
                      />
                      {paymentErrors.cardName && (
                        <p className="text-sm text-destructive">
                          {paymentErrors.cardName}
                        </p>
                      )}
                    </div>

                    <Alert>
                      <AlertDescription>
                        Esta es una demostración. No se procesarán pagos reales.
                        Usa cualquier número de tarjeta válido.
                      </AlertDescription>
                    </Alert>

                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep("shipping")}
                        className="flex-1"
                      >
                        Volver
                      </Button>
                      <Button
                        type="submit"
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          `Pagar $${total.toFixed(2)}`
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {currentStep === "confirmation" && (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-foreground font-sans mb-4">
                    ¡Pedido Confirmado!
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Tu pedido ha sido procesado exitosamente. Recibirás un email
                    de confirmación en breve.
                  </p>
                  <div className="bg-muted p-4 rounded-lg mb-6">
                    <p className="font-semibold">Número de Pedido</p>
                    <p className="text-lg font-mono">{orderId}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild>
                      <Link href="/order">Ver Mis Pedidos</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/">Seguir Comprando</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => {
                  const discountedPrice = item.product.discount
                    ? item.product.price * (1 - item.product.discount / 100)
                    : item.product.price;

                  return (
                    <div
                      key={item.product.id}
                      className="flex items-center space-x-3"
                    >
                      <div className="relative">
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {item.quantity}
                        </Badge>
                        <div className="w-12 h-12 bg-muted rounded-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${discountedPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${(discountedPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span className={shipping === 0 ? "text-green-600" : ""}>
                      {shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Impuestos</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

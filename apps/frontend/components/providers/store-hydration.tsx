"use client";

import { useEffect, useState } from "react";

export function StoreHydration({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Marcar como hidratado después de que el componente se monte
    setIsHydrated(true);
  }, []);

  // No mostrar loading, solo asegurar que el componente se monte en el cliente
  return <>{children}</>;
}

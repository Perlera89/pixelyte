"use client";

import { useEffect, useState } from "react";

/**
 * Hook para manejar la hidratación del lado del cliente
 * Evita problemas de hidratación entre servidor y cliente
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Asegurar que estamos en el cliente
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

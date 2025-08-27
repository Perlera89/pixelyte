"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/lib/providers/query-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { SyncProvider } from "@/lib/providers/sync-provider";
import { Toaster } from "@/components/ui/toaster";

type Props = {
  children: ReactNode;
};

export default function Providers({ children }: Props) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthProvider>
          <SyncProvider
            autoSyncOnLogin={true}
            periodicSyncInterval={5}
            showSyncNotifications={false}
          >
            {children}
            <Toaster />
          </SyncProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

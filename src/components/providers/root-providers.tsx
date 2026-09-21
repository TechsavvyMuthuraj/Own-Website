"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./theme-provider";
import { StyleProvider } from "@/components/theme/style-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { CartProvider } from "@/lib/cart/cart-store";
import { ClickSoundProvider } from "@/components/ui/click-sound-provider";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { ToastProvider } from "@/components/ui/toast";
import { CookieConsent } from "@/components/ui/cookie-consent";

export function RootProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute fresh time to prevent redundant requests
            gcTime: 5 * 60 * 1000, // 5 minutes garbage collection cache
            refetchOnWindowFocus: false, // Prevents sudden Supabase floods when switching tabs
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <StyleProvider>
          <AuthProvider>
            <CartProvider>
              <ClickSoundProvider>
                <ToastProvider>
                  {children}
                  <ScrollToTop />
                  <CookieConsent />
                </ToastProvider>
              </ClickSoundProvider>
            </CartProvider>
          </AuthProvider>
        </StyleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

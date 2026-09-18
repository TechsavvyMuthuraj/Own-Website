"use client";

import React from "react";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "@/lib/auth/auth-context";
import { CartProvider } from "@/lib/cart/cart-store";
import { ClickSoundProvider } from "@/components/ui/click-sound-provider";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { ToastProvider } from "@/components/ui/toast";

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <CartProvider>
          <ClickSoundProvider>
            <ToastProvider>
              {children}
              <ScrollToTop />
            </ToastProvider>
          </ClickSoundProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

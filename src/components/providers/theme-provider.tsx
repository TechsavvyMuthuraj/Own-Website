"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Suppress React 19 false positive console warnings caused by next-themes inline SSR script or browser extensions (Bitdefender, etc.)
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const firstArg = typeof args[0] === "string" ? args[0] : "";
    const allArgsStr = args
      .map((a) => {
        if (typeof a === "string") return a;
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      })
      .join(" ");

    if (
      firstArg.includes("Encountered a script tag while rendering React component") ||
      firstArg.includes("Scripts inside React components are never executed") ||
      allArgsStr.includes("bis_skin_checked") ||
      allArgsStr.includes("bis_register") ||
      allArgsStr.includes("__processed_") ||
      (allArgsStr.includes("hydrated but some attributes") && allArgsStr.includes("browser extension"))
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}


"use client";

import React, { Component, type ReactNode } from "react";

interface AdsterraErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  slotName?: string;
}

interface AdsterraErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

/**
 * Isolated Error Boundary for Advertising Units
 * Guarantees that ad-network failures, ad-blocker DOM clashes, or external script errors
 * will NEVER crash the host page, produce unhandled runtime errors, or loop endlessly.
 */
export class AdsterraErrorBoundary extends Component<
  AdsterraErrorBoundaryProps,
  AdsterraErrorBoundaryState
> {
  constructor(props: AdsterraErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): AdsterraErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || "Advertising component error",
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[Adsterra Safe Container] Suppressed error in ad slot "${this.props.slotName || "unknown"}":`,
        error.message,
        errorInfo
      );
    }
  }

  render() {
    if (this.state.hasError) {
      // Suppress failed unit cleanly with fallback or invisible zero-height container
      return this.props.fallback !== undefined ? this.props.fallback : null;
    }
    return this.props.children;
  }
}

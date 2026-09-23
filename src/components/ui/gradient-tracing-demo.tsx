"use client";

import React from "react";
import { GradientTracing } from "@/components/ui/gradient-tracing";

export const GradientTracingDemo = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-neutral-950 rounded-2xl border border-neutral-800">
    <GradientTracing
      width={300}
      height={100}
      path="M0,50 L75,25 L150,75 L225,25 L300,50"
    />
  </div>
);

export { GradientTracingDemo as Demo };
export default GradientTracingDemo;

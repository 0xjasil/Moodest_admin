"use client";
import React from "react";
import { ConfigurableProductProvider } from "@/context/ConfigurableProductContext";
import { VariationTemplatesProvider } from "@/context/VariationTemplatesContext";

export default function ProvidersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VariationTemplatesProvider>
      <ConfigurableProductProvider>{children}</ConfigurableProductProvider>
    </VariationTemplatesProvider>
  );
}

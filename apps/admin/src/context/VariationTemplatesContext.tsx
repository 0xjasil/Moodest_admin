"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AttributeItem, INITIAL_ATTRIBUTES, VariationValue } from "@/components/variations/variations.mock";
import { apiFetch } from "@/lib/apiFetch";

const STORAGE_KEY = "moodest_variation_templates_v1";

export interface VariationTemplatesContextType {
  attributes: AttributeItem[];
  setAttributes: React.Dispatch<React.SetStateAction<AttributeItem[]>>;
  loading: boolean;
  createAttribute: (data: Omit<AttributeItem, "id" | "productCount" | "values"> & { values?: VariationValue[] }) => Promise<AttributeItem>;
  updateAttribute: (id: string, data: Partial<AttributeItem>) => Promise<void>;
  deleteAttribute: (id: string) => Promise<void>;
  duplicateAttribute: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
  createValue: (attributeId: string, value: Omit<VariationValue, "id">) => Promise<void>;
  updateValue: (attributeId: string, valueId: string, data: Partial<VariationValue>) => Promise<void>;
  deleteValue: (attributeId: string, valueId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const VariationTemplatesContext = createContext<VariationTemplatesContextType | null>(null);

function generateId(prefix = "attr") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function VariationTemplatesProvider({ children }: { children: React.ReactNode }) {
  const [attributes, setAttributes] = useState<AttributeItem[]>(INITIAL_ATTRIBUTES);
  const [loading, setLoading] = useState(true);

  // Load from localStorage or API on mount
  useEffect(() => {
    const load = async () => {
      try {
        // Try backend first (non-blocking graceful fallback)
        try {
          const res = await apiFetch("/variation-templates");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : data?.data || data?.templates || null;
            if (list && Array.isArray(list) && list.length > 0) {
              // Normalize backend shape to AttributeItem if needed
              const normalized: AttributeItem[] = list.map((a: any) => ({
                id: String(a.id),
                name: a.name,
                category: a.category || "Abayas",
                productCount: a.productCount ?? a.productsCount ?? a._count?.products ?? 0,
                status: a.status || "active",
                type: a.type || "text",
                description: a.description || "",
                values: Array.isArray(a.values)
                  ? a.values.map((v: any) => ({
                      id: String(v.id),
                      name: v.name || v.value,
                      colorHex: v.colorHex || v.hex || undefined,
                      description: v.description || "",
                      products: v.products || [],
                    }))
                  : [],
              }));
              setAttributes(normalized);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
              setLoading(false);
              return;
            }
          }
        } catch {
          // fallback to local
        }

        // LocalStorage fallback
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAttributes(parsed);
          } else {
            setAttributes(INITIAL_ATTRIBUTES);
          }
        } else {
          setAttributes(INITIAL_ATTRIBUTES);
        }
      } catch {
        setAttributes(INITIAL_ATTRIBUTES);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Persist to localStorage on change (after initial load)
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(attributes));
      } catch {}
    }
  }, [attributes, loading]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setAttributes(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  }, []);

  const createAttribute: VariationTemplatesContextType["createAttribute"] = useCallback(async (data) => {
    const newAttr: AttributeItem = {
      id: generateId("attr"),
      name: data.name,
      category: data.category,
      productCount: 0,
      status: data.status || "active",
      type: data.type || "text",
      description: data.description || "",
      values: (data.values || []).map((v) => ({ ...v, id: v.id || generateId("val") })),
    };
    // Try backend
    try {
      const res = await apiFetch("/variation-templates", { method: "POST", body: JSON.stringify(newAttr) });
      if (res.ok) {
        const created = await res.json().catch(() => newAttr);
        const id = created?.id ? String(created.id) : newAttr.id;
        newAttr.id = id;
      }
    } catch {}
    setAttributes((prev) => [newAttr, ...prev]);
    return newAttr;
  }, []);

  const updateAttribute: VariationTemplatesContextType["updateAttribute"] = useCallback(async (id, data) => {
    setAttributes((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
    try {
      await apiFetch(`/variation-templates/${id}`, { method: "PATCH", body: JSON.stringify(data) }).catch(() => null);
    } catch {}
  }, []);

  const deleteAttribute: VariationTemplatesContextType["deleteAttribute"] = useCallback(async (id) => {
    setAttributes((prev) => prev.filter((a) => a.id !== id));
    try {
      await apiFetch(`/variation-templates/${id}`, { method: "DELETE" }).catch(() => null);
    } catch {}
  }, []);

  const duplicateAttribute: VariationTemplatesContextType["duplicateAttribute"] = useCallback(async (id) => {
    const source = attributes.find((a) => a.id === id);
    if (!source) return;
    const duplicated: AttributeItem = {
      ...source,
      id: generateId("attr"),
      name: `${source.name} (Copy)`,
      values: source.values.map((v) => ({ ...v, id: generateId("val") })),
    };
    setAttributes((prev) => [duplicated, ...prev]);
  }, [attributes]);

  const toggleStatus: VariationTemplatesContextType["toggleStatus"] = useCallback(async (id) => {
    setAttributes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === "active" ? "hidden" : "active" } : a))
    );
  }, []);

  const createValue: VariationTemplatesContextType["createValue"] = useCallback(async (attributeId, value) => {
    const newVal: VariationValue = { id: generateId("val"), ...value };
    setAttributes((prev) =>
      prev.map((a) => (a.id === attributeId ? { ...a, values: [...a.values, newVal] } : a))
    );
  }, []);

  const updateValue: VariationTemplatesContextType["updateValue"] = useCallback(async (attributeId, valueId, data) => {
    setAttributes((prev) =>
      prev.map((a) =>
        a.id === attributeId
          ? { ...a, values: a.values.map((v) => (v.id === valueId ? { ...v, ...data } : v)) }
          : a
      )
    );
  }, []);

  const deleteValue: VariationTemplatesContextType["deleteValue"] = useCallback(async (attributeId, valueId) => {
    setAttributes((prev) =>
      prev.map((a) => (a.id === attributeId ? { ...a, values: a.values.filter((v) => v.id !== valueId) } : a))
    );
  }, []);

  return (
    <VariationTemplatesContext.Provider
      value={{
        attributes,
        setAttributes,
        loading,
        createAttribute,
        updateAttribute,
        deleteAttribute,
        duplicateAttribute,
        toggleStatus,
        createValue,
        updateValue,
        deleteValue,
        refresh,
      }}
    >
      {children}
    </VariationTemplatesContext.Provider>
  );
}

export function useVariationTemplates() {
  const ctx = useContext(VariationTemplatesContext);
  if (!ctx) throw new Error("useVariationTemplates must be used within VariationTemplatesProvider");
  return ctx;
}

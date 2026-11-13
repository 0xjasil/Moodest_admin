"use client";

/**
 * VariationPicker — Bridge between Variation Templates and Add Product
 * Used inside ConfigProductFormLayout to let users apply templates to generate variants.
 * Shows available templates from VariationTemplatesContext, links to management page,
 * and triggers the AbayaVariantsManager generator with pre-filled selections.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useVariationTemplates } from "@/context/VariationTemplatesContext";
import { AttributeItem } from "./variations.mock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useConfigurableProduct } from "@/context/ConfigurableProductContext";
import { useEditProduct } from "@/context/EcitProductContext";
import { toast } from "sonner";

const makeIcon = (iconName: string) => (props: { className?: string }) => <Icon icon={iconName} className={props.className} />;
const Sparkles = makeIcon("lucide:sparkles");
const Layers = makeIcon("lucide:layers");
const Palette = makeIcon("lucide:palette");
const TypeIcon = makeIcon("lucide:type");
const ArrowRight = makeIcon("lucide:arrow-right");
const Check = makeIcon("lucide:check");
const Plus = makeIcon("lucide:plus");
const ExternalLink = makeIcon("lucide:external-link");

const TOKENS = {
  theme700: "#004EEB",
  theme900: "#00359E",
  bgPage: "#EEF2F6",
  borderLight: "#E3E8EF",
  borderMid: "#D2D6DE",
  textSecondary: "#697586",
  textPrimary: "#000000",
  textMuted: "#4B5565",
  accentPurple: "#9E458B",
  accentGreen: "#047857",
  radiusMd: "12px",
  radiusSm: "8px",
};

export function VariationTemplatePickerInline({ onApply }: { onApply?: (templates: AttributeItem[]) => void }) {
  const { attributes } = useVariationTemplates();
  // Support both create (ConfigurableProduct) and edit (EcitProduct) contexts
  let ctx: any = null;
  try { ctx = useConfigurableProduct(); } catch {}
  let editCtx: any = null;
  try { editCtx = useEditProduct(); } catch {}
  const activeCtx = ctx || editCtx;
  const { setVariants, variants, baseProduct } = activeCtx || { setVariants: () => {}, variants: [], baseProduct: { name: "Product", basePrice: 0, baseQuantity: 0 } };
  const [selectedIds, setSelectedIds] = useState<string[]>(() => attributes.filter((a) => a.status === "active").slice(0, 1).map((a) => a.id));

  const selectedTemplates = useMemo(() => attributes.filter((a) => selectedIds.includes(a.id)), [attributes, selectedIds]);
  const totalValues = useMemo(() => selectedTemplates.reduce((acc, a) => acc + a.values.length, 0), [selectedTemplates]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleQuickApply = () => {
    if (selectedTemplates.length === 0) {
      toast.error("Select at least one variation template");
      return;
    }
    // Build combinations: for simplicity we support Size + Color double template
    // Find size-like and color-like templates
    const sizeTemplate = selectedTemplates.find((a) => a.name.toLowerCase().includes("size") || a.type === "button") || selectedTemplates[0];
    const colorTemplate = selectedTemplates.find((a) => a.type === "color");

    const sizes = sizeTemplate ? sizeTemplate.values.map((v) => v.name.replace(/^Size\s+/i, "").trim() || v.name) : [];
    const colors = colorTemplate ? colorTemplate.values.map((v) => ({ name: v.name, hex: v.colorHex })) : [];

    // If we have sizes/colors, auto-generate variants into the context
    // We need to replicate the generator logic here but lightweight
    const basePrice = baseProduct.basePrice || 1000;
    const baseQty = baseProduct.baseQuantity || 10;
    const productName = baseProduct.name || "Product";

    const getProductSkuPrefix = (name: string) => {
      if (!name || !name.trim()) return "PROD";
      const clean = name.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, "").split(/\s+/).filter(Boolean);
      if (!clean.length) return "PROD";
      return clean[0].slice(0, 6);
    };
    const getColorCode = (colorName: string) => {
      if (!colorName) return "";
      const mapping: Record<string, string> = {
        "onyx black": "BLK", "midnight navy": "NVY", "olive green": "OLV", "royal burgundy": "BRG",
        "warm beige": "BGE", "dusty rose": "ROSE", "pearl white": "WHT", "charcoal grey": "GRY", "desert taupe": "TPE",
      };
      if (mapping[colorName.toLowerCase()]) return mapping[colorName.toLowerCase()];
      return colorName.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3) || "COL";
    };
    const generateSku = (prodName: string, size: string, color: string) => {
      const prod = getProductSkuPrefix(prodName);
      const col = color ? getColorCode(color) : "";
      let sizePart = (size || "").trim().toUpperCase();
      if (sizePart.includes("FREE")) sizePart = "FREE";
      else if (!/^[0-9]+$/.test(sizePart)) {
        const m = sizePart.match(/\d+/);
        sizePart = m ? `CUST${m[0]}` : "CUST";
      }
      return col ? `MDS-${prod}-${col}-${sizePart}` : `MDS-${prod}-${sizePart}`;
    };

    const newVariants: any[] = [];
    const effectiveSizes = sizes.length ? sizes : ["54"];
    const effectiveColors: Array<{ name: string; hex?: string | null }> = colors.length ? colors : [{ name: "", hex: null }];

    effectiveSizes.forEach((sz) => {
      effectiveColors.forEach((col) => {
        const exists = variants.some((v: any) => {
          const vCol = (v.color || "").trim().toLowerCase();
          const curCol = (col.name || "").trim().toLowerCase();
          return v.size === sz && vCol === curCol;
        });
        if (exists) return;
        let distinctSku = generateSku(productName, sz, col.name);
        let c = 1;
        while (variants.some((v: any) => v.sku.toUpperCase() === distinctSku.toUpperCase()) || newVariants.some((v) => v.sku.toUpperCase() === distinctSku.toUpperCase())) {
          distinctSku = `${generateSku(productName, sz, col.name)}-${c++}`;
        }
        newVariants.push({
          id: `temp_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          size: sz,
          color: col.name || "",
          colorHex: col.hex || null,
          sku: distinctSku,
          price: basePrice,
          offerPrice: null,
          qty: baseQty,
          isActive: true,
          isNew: true,
          images: [],
          attributes: [
            { attributeId: "size", valueId: sz, attributeName: "Size", value: sz },
            ...(col.name ? [{ attributeId: "color", valueId: col.name, attributeName: "Color", value: col.name }] : []),
          ],
        });
      });
    });

    if (newVariants.length === 0) {
      toast.info("All combinations from selected templates already exist in this product.");
      return;
    }
    setVariants([...variants, ...newVariants]);
    toast.success(`Applied ${newVariants.length} variants from ${selectedTemplates.length} template${selectedTemplates.length > 1 ? "s" : ""}`);
    onApply?.(selectedTemplates);
  };

  // Quick stats
  const activeCount = attributes.filter((a) => a.status === "active").length;

  return (
    <Card className="variation-picker-card overflow-hidden w-full border shadow-xs" style={{ borderColor: TOKENS.borderLight, borderRadius: TOKENS.radiusMd, background: "white" }}>
      <CardHeader className="pb-3 border-b" style={{ borderColor: TOKENS.borderLight, background: "#EEF2F6" }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2" style={{ color: TOKENS.theme900 }}>
              <Sparkles className="size-4" style={{ color: TOKENS.theme700 }} /> Variation Templates
              <Badge variant="secondary" className="rounded-full text-xs font-semibold ml-1" style={{ background: "white", color: TOKENS.textMuted, borderColor: TOKENS.borderLight } as any}>
                {activeCount} active
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs mt-1 max-w-xl" style={{ color: TOKENS.textSecondary }}>
              Select reusable attributes to auto-generate size/color variants with consistent SKUs. Use the manager to edit templates — changes sync instantly here.
            </CardDescription>
          </div>
          <Link
            href="/products/variations"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium underline decoration-dotted hover:opacity-80 shrink-0"
            style={{ color: TOKENS.theme700 }}
          >
            Manage templates <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 font-medium" style={{ borderColor: TOKENS.borderLight, color: TOKENS.textMuted }}>
            <Layers className="size-3.5" style={{ color: TOKENS.theme700 }} /> {attributes.length} templates • {attributes.reduce((a, c) => a + c.values.length, 0)} values
          </span>
          <Link href="/products/variations" className="sm:hidden inline-flex items-center gap-1 text-xs font-medium" style={{ color: TOKENS.theme700 }}>
            Manage <ArrowRight className="size-3" />
          </Link>
        </div>

        {attributes.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center" style={{ borderColor: TOKENS.borderMid, background: TOKENS.bgPage, borderRadius: TOKENS.radiusSm }}>
            <p className="text-sm font-medium" style={{ color: TOKENS.textSecondary }}>No variation templates yet</p>
            <p className="text-xs mt-1" style={{ color: TOKENS.textSecondary }}>Create templates to power your product variants.</p>
            <Link href="/products/variations">
              <Button size="sm" className="mt-3 rounded-lg cursor-pointer" style={{ background: TOKENS.theme700, color: "white" }}>
                <Plus className="size-4 mr-1" /> Create template
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
              {attributes.map((attr) => {
                const isSelected = selectedIds.includes(attr.id);
                return (
                  <button
                    key={attr.id}
                    onClick={() => toggle(attr.id)}
                    className={cn(
                      "text-left rounded-lg border p-3 flex flex-col gap-2 transition-all cursor-pointer group",
                      isSelected ? "shadow-sm" : "bg-white hover:bg-[#EEF2F6]/70"
                    )}
                    style={{
                      borderColor: isSelected ? TOKENS.theme700 : TOKENS.borderLight,
                      background: isSelected ? "#EFF6FF" : "white",
                      borderRadius: TOKENS.radiusSm,
                    }}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="size-7 rounded-lg flex items-center justify-center shrink-0 border" style={{ background: "white", borderColor: TOKENS.borderLight }}>
                          {attr.type === "color" ? <Palette className="size-4" style={{ color: TOKENS.accentPurple }} /> : attr.type === "button" ? <Layers className="size-4" style={{ color: TOKENS.theme700 }} /> : <TypeIcon className="size-4" style={{ color: TOKENS.textSecondary }} />}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: TOKENS.textMuted }}>{attr.name}</p>
                          <p className="text-[11px] truncate" style={{ color: TOKENS.textSecondary }}>{attr.category} • {attr.type}</p>
                        </div>
                      </div>
                      <span className={cn("size-5 rounded-full border flex items-center justify-center shrink-0 transition-colors")} style={{ background: isSelected ? TOKENS.theme700 : "white", borderColor: isSelected ? TOKENS.theme700 : TOKENS.borderMid }}>
                        {isSelected && <Check className="size-3 text-white" />}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {attr.values.slice(0, 3).map((v) => (
                        <span key={v.id} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]" style={{ background: "white", borderColor: TOKENS.borderLight, color: TOKENS.textMuted }}>
                          {v.colorHex && <span className="size-2.5 rounded-full border" style={{ background: v.colorHex, borderColor: TOKENS.borderMid }} />} {v.name}
                        </span>
                      ))}
                      {attr.values.length > 3 && <span className="text-[11px] px-1" style={{ color: TOKENS.theme700 }}>+{attr.values.length - 3}</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t" style={{ borderColor: TOKENS.borderLight }}>
              <p className="text-xs" style={{ color: TOKENS.textSecondary }}>
                {selectedIds.length === 0 ? "Select templates to preview combinations" : `${selectedTemplates.length} template${selectedTemplates.length > 1 ? "s" : ""} • ${totalValues} values • ~${(() => {
                  const sz = selectedTemplates.find((a) => a.name.toLowerCase().includes("size"))?.values.length || selectedTemplates[0]?.values.length || 1;
                  const col = selectedTemplates.find((a) => a.type === "color")?.values.length || 1;
                  return selectedTemplates.length > 1 ? sz * col : sz;
                })()} combos`}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedIds([])} className="rounded-lg cursor-pointer flex-1 sm:flex-none" style={{ borderColor: TOKENS.borderLight }}>Clear</Button>
                <Button size="sm" onClick={handleQuickApply} disabled={selectedIds.length === 0} className="rounded-lg cursor-pointer flex-1 sm:flex-none font-semibold shadow-xs" style={{ background: TOKENS.theme700, color: "white", opacity: selectedIds.length === 0 ? 0.6 : 1 }}>
                  <Sparkles className="size-4 mr-1" /> Apply {selectedIds.length > 0 ? `${selectedTemplates.reduce((acc, t) => acc + t.values.length, 0)} values` : ""} to variants
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

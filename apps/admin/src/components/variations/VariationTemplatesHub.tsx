"use client";

/**
 * Variations — Design System Implementation
 * 
 * Intent: Manage reusable variation templates that power product variants across the catalog.
 * One primary CTA per view, trust signals first, speed over polish.
 * 
 * Tokens used:
 *  Colors: --theme-900 #00359E, --theme-700 #004EEB, --theme-800 #0040C1, color-19 #EEF2F6, color-21 #FFFFFF,
 *          color-1 #000000, color-4 #4B5565, color-5 #555555, color-10 #697586, color-14 #9CA3AF, color-15 #9AA4B2,
 *          color-8 #9E458B, color-9 #047857, color-11 #337AB7, color-12 #2970FF, color-13 #3C8DBC, color-16 #47CD89,
 *          color-17 #D2D6DE, color-18 #E3E8EF, color-20 #F4F4F4
 *  Typography: Source Sans Pro / Inter, text-xs 12px, text-sm 14px, text-base 16px, text-lg 18px, text-xl 21px, text-2xl 24px, weights 400/500/600/700/900
 *  Spacing: 4px base unit, scale 2px .. 102px
 *  Radius: 8px (sm), 12px (md), 9999px (full)
 *  Elevation: shadow-sm..shadow-xl as per tokens
 */

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useVariationTemplates } from "@/context/VariationTemplatesContext";
import { AttributeItem, CATEGORIES, VariationCategory, VariationValue } from "./variations.mock";
import DeleteDialog from "./delete-attribute-dialogue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Icons
const makeIcon = (iconName: string) => (props: { className?: string }) => <Icon icon={iconName} className={props.className} />;
const Plus = makeIcon("lucide:plus");
const SearchIcon = makeIcon("lucide:search");
const Layers = makeIcon("lucide:layers");
const Palette = makeIcon("lucide:palette");
const TypeIcon = makeIcon("lucide:type");
const ToggleLeft = makeIcon("lucide:toggle-left");
const Eye = makeIcon("lucide:eye");
const EyeOff = makeIcon("lucide:eye-off");
const Edit2 = makeIcon("lucide:pencil");
const CopyIcon = makeIcon("lucide:copy");
const Trash2 = makeIcon("lucide:trash-2");
const MoreHorizontal = makeIcon("lucide:more-horizontal");
const ChevronDown = makeIcon("lucide:chevron-down");
const ChevronUp = makeIcon("lucide:chevron-up");
const Package = makeIcon("lucide:package");
const Sparkles = makeIcon("lucide:sparkles");
const ShieldCheck = makeIcon("lucide:shield-check");
const Zap = makeIcon("lucide:zap");
const ArrowRight = makeIcon("lucide:arrow-right");
const ExternalLink = makeIcon("lucide:external-link");
const Filter = makeIcon("lucide:filter");
const X = makeIcon("lucide:x");

// Design token constants (for documentation & inline usage)
const TOKENS = {
  theme900: "#00359E",
  theme700: "#004EEB",
  theme800: "#0040C1",
  bgPage: "#EEF2F6",
  bgCard: "#FFFFFF",
  textPrimary: "#000000",
  textPrimaryMuted: "#4B5565",
  textSecondary: "#697586",
  textSecondaryLight: "#9CA3AF",
  borderLight: "#E3E8EF",
  borderMid: "#D2D6DE",
  borderSoft: "#F4F4F4",
  accentPurple: "#9E458B",
  accentGreen: "#047857",
  accentBlue: "#337AB7",
  accentBlueBright: "#2970FF",
  accentBlueSoft: "#3C8DBC",
  accentMint: "#47CD89",
  radiusSm: "8px",
  radiusMd: "12px",
  radiusFull: "9999px",
} as const;

type SortBy = "name" | "products" | "values";
type FilterType = "all" | "text" | "color" | "button";

// VariationTemplatesHub: main page component
export default function VariationTemplatesHub() {
  const { attributes, loading, createAttribute, updateAttribute, deleteAttribute, duplicateAttribute, toggleStatus, createValue, updateValue, deleteValue } = useVariationTemplates();

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<VariationCategory>("All");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Dialog states
  const [addOpen, setAddOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<AttributeItem | null>(null);
  const [valueDialogAttrId, setValueDialogAttrId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<{ attrId: string; value: VariationValue } | null>(null);

  // Add / Edit attribute form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<AttributeItem["category"]>("Abayas");
  const [formType, setFormType] = useState<AttributeItem["type"]>("text");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "hidden">("active");

  // Value form state
  const [valName, setValName] = useState("");
  const [valHex, setValHex] = useState("#000000");
  const [valDesc, setValDesc] = useState("");

  // Derived stats for trust signals
  const stats = useMemo(() => {
    const totalValues = attributes.reduce((acc, a) => acc + a.values.length, 0);
    const activeCount = attributes.filter((a) => a.status === "active").length;
    const totalProducts = attributes.reduce((acc, a) => acc + a.productCount, 0);
    const categoriesUsed = new Set(attributes.map((a) => a.category)).size;
    return { totalValues, activeCount, totalProducts, categoriesUsed };
  }, [attributes]);

  const filtered = useMemo(() => {
    let list = [...attributes];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) => a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q) || a.values.some((v) => v.name.toLowerCase().includes(q))
      );
    }
    if (categoryFilter !== "All") list = list.filter((a) => a.category === categoryFilter);
    if (typeFilter !== "all") list = list.filter((a) => a.type === typeFilter);
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "products") list.sort((a, b) => b.productCount - a.productCount);
    if (sortBy === "values") list.sort((a, b) => b.values.length - a.values.length);
    return list;
  }, [attributes, search, categoryFilter, typeFilter, statusFilter, sortBy]);

  const resetForm = () => {
    setFormName("");
    setFormCategory("Abayas");
    setFormType("text");
    setFormDescription("");
    setFormStatus("active");
    setEditingAttr(null);
  };

  const openAdd = () => {
    resetForm();
    setAddOpen(true);
  };

  const openEdit = (attr: AttributeItem) => {
    setEditingAttr(attr);
    setFormName(attr.name);
    setFormCategory(attr.category);
    setFormType(attr.type);
    setFormDescription(attr.description || "");
    setFormStatus(attr.status);
    setAddOpen(true);
  };

  const handleSaveAttribute = async () => {
    if (!formName.trim()) {
      toast.error("Variation name is required");
      return;
    }
    try {
      if (editingAttr) {
        await updateAttribute(editingAttr.id, {
          name: formName.trim(),
          category: formCategory,
          type: formType,
          description: formDescription.trim(),
          status: formStatus,
        });
        toast.success(`Variation "${formName}" updated`);
      } else {
        await createAttribute({
          name: formName.trim(),
          category: formCategory,
          type: formType,
          description: formDescription.trim(),
          status: formStatus,
        });
        toast.success(`Variation "${formName}" created`);
      }
      setAddOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save variation");
    }
  };

  const openAddValue = (attrId: string) => {
    setValName("");
    setValHex("#000000");
    setValDesc("");
    setEditingValue(null);
    setValueDialogAttrId(attrId);
  };

  const openEditValue = (attrId: string, v: VariationValue) => {
    setValName(v.name);
    setValHex(v.colorHex || "#000000");
    setValDesc(v.description || "");
    setEditingValue({ attrId, value: v });
    setValueDialogAttrId(attrId);
  };

  const handleSaveValue = async () => {
    if (!valName.trim()) {
      toast.error("Value name is required");
      return;
    }
    if (!valueDialogAttrId) return;
    const attr = attributes.find((a) => a.id === valueDialogAttrId);
    const needsHex = attr?.type === "color";
    if (needsHex && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(valHex)) {
      toast.error("Provide a valid hex color (e.g. #0A192F)");
      return;
    }
    try {
      if (editingValue) {
        await updateValue(editingValue.attrId, editingValue.value.id, {
          name: valName.trim(),
          colorHex: needsHex ? valHex : undefined,
          description: valDesc.trim(),
        });
        toast.success("Value updated");
      } else {
        await createValue(valueDialogAttrId, {
          name: valName.trim(),
          colorHex: needsHex ? valHex : undefined,
          description: valDesc.trim(),
          products: [],
        });
        toast.success("Value added");
      }
      setValueDialogAttrId(null);
      setEditingValue(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to save value");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3" style={{ background: TOKENS.bgPage }}>
        <div className="size-8 animate-spin rounded-full border-2 border-[#E3E8EF] border-t-[#004EEB]" />
        <p className="text-sm" style={{ color: TOKENS.textSecondary }}>Loading variation templates…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: TOKENS.bgPage }}>
      {/* Inject variation design tokens as CSS variables scoped to this page */}
      <style>{`
        .variation-page { --theme-900: ${TOKENS.theme900}; --theme-700: ${TOKENS.theme700}; --theme-800: ${TOKENS.theme800}; --bg-page: ${TOKENS.bgPage}; --bg-card: ${TOKENS.bgCard}; --text-primary: ${TOKENS.textPrimary}; --text-muted: ${TOKENS.textPrimaryMuted}; --text-secondary: ${TOKENS.textSecondary}; --border-light: ${TOKENS.borderLight}; --border-mid: ${TOKENS.borderMid}; --radius-sm: ${TOKENS.radiusSm}; --radius-md: ${TOKENS.radiusMd}; }
        .variation-card { border-radius: var(--radius-md); border: 1px solid var(--border-light); background: var(--bg-card); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .variation-row:hover { background: #EEF2F6; }
        .variation-row:focus-within { outline: 2px solid #004EEB; outline-offset: -2px; }
        .primary-cta { background: #004EEB; color: white; border-radius: 8px; transition: background 0.15s; }
        .primary-cta:hover { background: #00359E; }
        .primary-cta:focus-visible { outline: 2px solid #00359E; outline-offset: 2px; }
        .primary-cta:disabled { background: ${TOKENS.textSecondaryLight}; cursor: not-allowed; opacity: 0.6; }
      `}</style>

      <div className="variation-page mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Trust signals bar */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white border px-3 py-1.5" style={{ borderColor: TOKENS.borderLight, color: TOKENS.textSecondary }}>
            <ShieldCheck className="size-3.5" style={{ color: TOKENS.accentGreen }} />
            Trusted by boutique catalog • {attributes.length} templates
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00359E] text-white px-3 py-1.5">
            <Zap className="size-3.5" /> {stats.activeCount} active • {stats.totalValues} values
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px]" style={{ color: TOKENS.textSecondary }}>
            <span style={{ color: TOKENS.accentBlueBright }}>●</span> Products linked: {stats.totalProducts} • Categories: {stats.categoriesUsed}
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: TOKENS.theme900 }}>
                Variations
              </h1>
              <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: TOKENS.bgPage, color: TOKENS.textSecondary, borderColor: TOKENS.borderLight } as any}>
                {filtered.length} of {attributes.length}
              </Badge>
            </div>
            <p className="mt-1 max-w-2xl text-sm" style={{ color: TOKENS.textSecondary }}>
              Define reusable attributes — <span className="font-semibold" style={{ color: TOKENS.textPrimaryMuted }}>sizes, colors, fabrics, silhouettes</span> — then apply them when you
              <Link href="/products/add" className="ml-1 underline decoration-dotted hover:text-[#00359E]" style={{ color: TOKENS.theme700 }}>
                add a product
              </Link>{" "}
              to auto-generate variants with consistent SKUs and pricing.
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: TOKENS.textSecondaryLight }}>
              <Link href="/products" className="hover:underline" style={{ color: TOKENS.accentBlueSoft }}>
                Products
              </Link>
              <span>›</span>
              <span className="font-medium" style={{ color: TOKENS.theme900 }}>Variation Templates</span>
              <span className="hidden sm:inline-flex items-center gap-1 ml-2 rounded bg-white border px-2 py-0.5 text-[11px]" style={{ borderColor: TOKENS.borderLight }}>
                <span className="size-1.5 rounded-full" style={{ background: TOKENS.accentGreen }} /> Live sync • Cloudinary ready
              </span>
            </div>
          </div>

          {/* Single Primary CTA per view */}
          <div className="flex items-center gap-2">
            <Link
              href="/products/add"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border bg-white px-3.5 py-2.5 text-sm font-medium hover:bg-[#EEF2F6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#004EEB]"
              style={{ borderColor: TOKENS.borderLight, color: TOKENS.textPrimaryMuted }}
            >
              <Package className="size-4" /> Add product with variations <ArrowRight className="size-3.5" />
            </Link>
            <button
              onClick={openAdd}
              className="primary-cta inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold shadow-sm cursor-pointer"
              aria-label="Add variation template"
            >
              <Plus className="size-4" /> Add Variation
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total templates", value: attributes.length, sub: "across 4 categories", icon: Layers, color: TOKENS.theme700, bg: "#EEF2F6" },
            { label: "Active", value: stats.activeCount, sub: `${attributes.length - stats.activeCount} hidden`, icon: Eye, color: TOKENS.accentGreen, bg: "#ECFDF5" },
            { label: "Total values", value: stats.totalValues, sub: "avg " + (attributes.length ? Math.round(stats.totalValues / attributes.length) : 0) + " per template", icon: Palette, color: TOKENS.accentPurple, bg: "#FDF2F8" },
            { label: "Products linked", value: stats.totalProducts, sub: "demo boutique catalog", icon: Package, color: TOKENS.accentBlue, bg: "#EFF6FF" },
          ].map((s) => (
            <div key={s.label} className="variation-card p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: TOKENS.textSecondaryLight }}>{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: TOKENS.textPrimary }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: TOKENS.textSecondary }}>{s.sub}</p>
              </div>
              <div className="size-10 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon className="size-5" style={{ color: s.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <Card className="variation-card mb-4 border shadow-sm">
          <CardContent className="p-3 sm:p-4 flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: TOKENS.textSecondaryLight }} />
              <Input
                placeholder="Search variations, colors, sizes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-lg"
                style={{ borderColor: TOKENS.borderLight, background: TOKENS.bgCard }}
                aria-label="Search variations"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border p-1" style={{ borderColor: TOKENS.borderLight, background: TOKENS.bgCard }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                      categoryFilter === cat ? "text-white shadow-sm" : "hover:bg-[#EEF2F6]"
                    )}
                    style={{
                      background: categoryFilter === cat ? TOKENS.theme700 : "transparent",
                      color: categoryFilter === cat ? "white" : TOKENS.textPrimaryMuted,
                    }}
                    aria-pressed={categoryFilter === cat}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FilterType)}>
                <SelectTrigger className="w-[150px] h-10 rounded-lg cursor-pointer" style={{ borderColor: TOKENS.borderLight }}>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                  <SelectItem value="button">Button</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-[140px] h-10 rounded-lg cursor-pointer" style={{ borderColor: TOKENS.borderLight }}>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                <SelectTrigger className="w-[140px] h-10 rounded-lg cursor-pointer" style={{ borderColor: TOKENS.borderLight }}>
                  <Filter className="size-3.5 mr-1" /> <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort: Name</SelectItem>
                  <SelectItem value="products">Sort: Products</SelectItem>
                  <SelectItem value="values">Sort: Values</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <Card className="variation-card border-dashed">
            <CardContent className="py-16 text-center flex flex-col items-center gap-3">
              <div className="size-14 rounded-full flex items-center justify-center" style={{ background: TOKENS.bgPage, border: `1px solid ${TOKENS.borderLight}` }}>
                <Layers className="size-7" style={{ color: TOKENS.textSecondary }} />
              </div>
              <h3 className="text-base font-semibold" style={{ color: TOKENS.textPrimary }}>No variations match your filters</h3>
              <p className="text-sm max-w-md" style={{ color: TOKENS.textSecondary }}>
                Try adjusting search or category filters, or create a new variation template to power your product variants.
              </p>
              <Button onClick={openAdd} className="mt-2 rounded-lg cursor-pointer" style={{ background: TOKENS.theme700, color: "white" }}>
                <Plus className="size-4 mr-2" /> Add Variation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block variation-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs font-semibold" style={{ background: TOKENS.bgPage, borderColor: TOKENS.borderLight, color: TOKENS.textSecondary }}>
                      <th className="text-left py-3 px-4 font-semibold">Variation</th>
                      <th className="text-left py-3 px-4 font-semibold">Category</th>
                      <th className="text-left py-3 px-4 font-semibold">Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Values</th>
                      <th className="text-left py-3 px-4 font-semibold">Products</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-right py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: TOKENS.borderSoft }}>
                    {filtered.map((attr) => (
                      <React.Fragment key={attr.id}>
                        <tr
                          className="variation-row transition-colors"
                          style={{ background: expandedId === attr.id ? TOKENS.bgPage : TOKENS.bgCard }}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-start gap-3 max-w-[320px]">
                              <div className="size-9 rounded-lg flex items-center justify-center shrink-0 border" style={{ background: TOKENS.bgCard, borderColor: TOKENS.borderLight }}>
                                {attr.type === "color" ? <Palette className="size-4" style={{ color: TOKENS.accentPurple }} /> : attr.type === "button" ? <ToggleLeft className="size-4" style={{ color: TOKENS.theme700 }} /> : <TypeIcon className="size-4" style={{ color: TOKENS.textSecondary }} />}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm leading-tight truncate" style={{ color: TOKENS.textPrimary }}>{attr.name}</p>
                                <p className="text-xs truncate max-w-[260px] mt-0.5" style={{ color: TOKENS.textSecondary }}>{attr.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant="secondary" className="rounded-full text-xs font-medium border" style={{ background: "white", borderColor: TOKENS.borderLight, color: TOKENS.textPrimaryMuted }}>{attr.category}</Badge>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 text-xs capitalize px-2.5 py-1 rounded-full border" style={{ background: attr.type === "color" ? "#FDF2F8" : attr.type === "button" ? "#EFF6FF" : "white", borderColor: TOKENS.borderLight, color: TOKENS.textPrimaryMuted }}>
                              <span className="size-1.5 rounded-full" style={{ background: attr.type === "color" ? TOKENS.accentPurple : attr.type === "button" ? TOKENS.theme700 : TOKENS.textSecondary }} /> {attr.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap max-w-[280px]">
                              {attr.values.slice(0, 4).map((v) => (
                                <span
                                  key={v.id}
                                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                                  style={{ background: TOKENS.bgCard, borderColor: TOKENS.borderLight, color: TOKENS.textPrimaryMuted }}
                                >
                                  {v.colorHex && (
                                    <span className="size-3 rounded-full border shrink-0" style={{ background: v.colorHex, borderColor: TOKENS.borderMid }} />
                                  )}
                                  {v.name}
                                </span>
                              ))}
                              {attr.values.length > 4 && (
                                <span className="text-xs font-medium" style={{ color: TOKENS.accentBlueBright }}>
                                  +{attr.values.length - 4} more
                                </span>
                              )}
                              {attr.values.length === 0 && (
                                <span className="text-xs italic" style={{ color: TOKENS.textSecondaryLight }}>No values yet</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-white border px-2.5 py-1" style={{ borderColor: TOKENS.borderLight, color: TOKENS.textPrimaryMuted }}>
                              <Package className="size-3.5" /> {attr.productCount}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => toggleStatus(attr.id)}
                              className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border cursor-pointer transition-colors")}
                              style={{
                                background: attr.status === "active" ? "#ECFDF5" : "#F9FAFB",
                                borderColor: attr.status === "active" ? "#A7F3D0" : TOKENS.borderLight,
                                color: attr.status === "active" ? TOKENS.accentGreen : TOKENS.textSecondary,
                              }}
                            >
                              <span className="size-1.5 rounded-full" style={{ background: attr.status === "active" ? TOKENS.accentGreen : TOKENS.textSecondaryLight }} /> {attr.status}
                            </button>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => setExpandedId(expandedId === attr.id ? null : attr.id)} title={expandedId === attr.id ? "Collapse" : "Expand values"}>
                                {expandedId === attr.id ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => openEdit(attr)} title="Edit variation">
                                <Edit2 className="size-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => duplicateAttribute(attr.id).then(() => toast.success(`Duplicated "${attr.name}"`))} title="Duplicate">
                                <CopyIcon className="size-4" />
                              </Button>
                              <DeleteDialog
                                itemName={attr.name}
                                itemType="variation template"
                                onDelete={async () => { await deleteAttribute(attr.id); }}
                                warningMessage={`This will remove ${attr.values.length} values and unlink ${attr.productCount} products from this template.`}
                                variant="ghost"
                                size="icon"
                                className="size-8 cursor-pointer"
                              />
                            </div>
                          </td>
                        </tr>
                        {expandedId === attr.id && (
                          <tr className="bg-[#EEF2F6]/60">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="rounded-lg border bg-white p-4" style={{ borderColor: TOKENS.borderLight, borderRadius: TOKENS.radiusMd }}>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: TOKENS.textPrimary }}>
                                    <Layers className="size-4" style={{ color: TOKENS.theme700 }} /> Values for &quot;{attr.name}&quot;
                                    <Badge variant="secondary" className="rounded-full text-xs" style={{ background: TOKENS.bgPage }}>{attr.values.length} values</Badge>
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <Link href="/products/add" className="text-xs underline hidden sm:inline-flex items-center gap-1" style={{ color: TOKENS.theme700 }}>
                                      Use in product <ExternalLink className="size-3" />
                                    </Link>
                                    <Button size="sm" onClick={() => openAddValue(attr.id)} className="rounded-lg h-8 cursor-pointer" style={{ background: TOKENS.theme700, color: "white" }}>
                                      <Plus className="size-4 mr-1" /> Add value
                                    </Button>
                                  </div>
                                </div>
                                {attr.values.length === 0 ? (
                                  <div className="text-center py-8 border border-dashed rounded-lg" style={{ borderColor: TOKENS.borderMid, background: TOKENS.bgPage }}>
                                    <Palette className="size-8 mx-auto mb-2" style={{ color: TOKENS.textSecondaryLight }} />
                                    <p className="text-sm font-medium" style={{ color: TOKENS.textSecondary }}>No values yet</p>
                                    <p className="text-xs mt-1" style={{ color: TOKENS.textSecondaryLight }}>Add sizes, colors, or material values to power variant generation.</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {attr.values.map((v) => (
                                      <div key={v.id} className="group flex items-center justify-between rounded-lg border p-3 hover:shadow-sm transition-all bg-white" style={{ borderColor: TOKENS.borderLight, borderRadius: TOKENS.radiusSm }}>
                                        <div className="flex items-center gap-3 min-w-0">
                                          {v.colorHex ? (
                                            <span className="size-8 rounded-full border shrink-0 relative overflow-hidden" style={{ background: v.colorHex, borderColor: TOKENS.borderMid }}>
                                              {v.colorHex.toLowerCase() === "#ffffff" && <span className="absolute inset-0 rounded-full border border-gray-200" />}
                                            </span>
                                          ) : (
                                            <span className="size-8 rounded-lg flex items-center justify-center shrink-0 border" style={{ background: TOKENS.bgPage, borderColor: TOKENS.borderLight }}>
                                              <TypeIcon className="size-4" style={{ color: TOKENS.textSecondary }} />
                                            </span>
                                          )}
                                          <div className="min-w-0">
                                            <p className="text-sm font-semibold truncate" style={{ color: TOKENS.textPrimary }}>{v.name}</p>
                                            <p className="text-xs truncate max-w-[160px]" style={{ color: TOKENS.textSecondary }}>{v.description || "—"}</p>
                                            {v.products && v.products.length > 0 && (
                                              <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: TOKENS.accentGreen }}>
                                                <Package className="size-3" /> {v.products.length} products
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                                          <Button variant="ghost" size="icon" className="size-7 cursor-pointer" onClick={() => openEditValue(attr.id, v)} title="Edit value">
                                            <Edit2 className="size-3.5" />
                                          </Button>
                                          <DeleteDialog
                                            itemName={v.name}
                                            itemType="value"
                                            onDelete={async () => { await deleteValue(attr.id, v.id); }}
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 cursor-pointer"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {attr.values.some((v) => v.products && v.products.length > 0) && (
                                  <div className="mt-4 pt-4 border-t" style={{ borderColor: TOKENS.borderSoft }}>
                                    <h5 className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: TOKENS.textSecondary }}>
                                      <Sparkles className="size-3.5" style={{ color: TOKENS.accentPurple }} /> Products using these values
                                    </h5>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                      {Array.from(new Map(attr.values.flatMap((v) => v.products || []).map((p) => [p.id, p])).values()).slice(0, 8).map((p) => (
                                        <div key={p.id} className="flex items-center gap-2 rounded-lg border bg-white p-2 min-w-[200px] shrink-0" style={{ borderColor: TOKENS.borderLight }}>
                                          <div className="relative size-10 rounded-md overflow-hidden shrink-0 border" style={{ borderColor: TOKENS.borderLight }}>
                                            <Image src={p.image || "/images/products/1.webp"} alt={p.name} fill className="object-cover" />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-xs font-semibold truncate" style={{ color: TOKENS.textPrimary }}>{p.name}</p>
                                            <p className="text-[11px] truncate" style={{ color: TOKENS.textSecondary }}>{p.sku} • {p.category}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden grid gap-3">
              {filtered.map((attr) => (
                <Card key={attr.id} className="variation-card overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-3 min-w-0">
                        <div className="size-10 rounded-lg flex items-center justify-center shrink-0 border" style={{ background: TOKENS.bgCard, borderColor: TOKENS.borderLight }}>
                          {attr.type === "color" ? <Palette className="size-5" style={{ color: TOKENS.accentPurple }} /> : attr.type === "button" ? <ToggleLeft className="size-5" style={{ color: TOKENS.theme700 }} /> : <TypeIcon className="size-5" style={{ color: TOKENS.textSecondary }} />}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-sm leading-tight" style={{ color: TOKENS.theme900 }}>{attr.name}</CardTitle>
                          <CardDescription className="text-xs mt-1 line-clamp-2" style={{ color: TOKENS.textSecondary }}>{attr.description}</CardDescription>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <Badge variant="secondary" className="rounded-full text-xs" style={{ background: TOKENS.bgPage, color: TOKENS.textPrimaryMuted }}>{attr.category}</Badge>
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border capitalize" style={{ borderColor: TOKENS.borderLight, color: TOKENS.textPrimaryMuted }}>{attr.type}</span>
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: TOKENS.borderLight, color: TOKENS.textPrimaryMuted }}>{attr.values.length} values</span>
                            <button
                              onClick={() => toggleStatus(attr.id)}
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border cursor-pointer"
                              style={{ background: attr.status === "active" ? "#ECFDF5" : "#F3F4F6", borderColor: attr.status === "active" ? "#A7F3D0" : TOKENS.borderLight, color: attr.status === "active" ? TOKENS.accentGreen : TOKENS.textSecondary }}
                            >
                              {attr.status === "active" ? <Eye className="size-3" /> : <EyeOff className="size-3" />}{attr.status}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => setExpandedId(expandedId === attr.id ? null : attr.id)}>
                          {expandedId === attr.id ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {attr.values.slice(0, 6).map((v) => (
                        <span key={v.id} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs" style={{ background: TOKENS.bgCard, borderColor: TOKENS.borderLight, color: TOKENS.textPrimaryMuted }}>
                          {v.colorHex && <span className="size-3 rounded-full border" style={{ background: v.colorHex, borderColor: TOKENS.borderMid }} />} {v.name}
                        </span>
                      ))}
                      {attr.values.length > 6 && <span className="text-xs px-2 py-1" style={{ color: TOKENS.accentBlueBright }}>+{attr.values.length - 6} more</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs flex items-center gap-1" style={{ color: TOKENS.textSecondary }}><Package className="size-3.5" /> {attr.productCount} products linked</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => openEdit(attr)}><Edit2 className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => duplicateAttribute(attr.id).then(() => toast.success("Duplicated"))}><CopyIcon className="size-4" /></Button>
                        <DeleteDialog itemName={attr.name} itemType="variation template" onDelete={async () => deleteAttribute(attr.id)} variant="ghost" size="icon" className="size-8 cursor-pointer" />
                      </div>
                    </div>
                    {expandedId === attr.id && (
                      <div className="rounded-lg border bg-white p-3 space-y-3" style={{ borderColor: TOKENS.borderLight }}>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold" style={{ color: TOKENS.textPrimary }}>Values ({attr.values.length})</p>
                          <Button size="sm" onClick={() => openAddValue(attr.id)} className="h-7 text-xs rounded-lg cursor-pointer" style={{ background: TOKENS.theme700, color: "white" }}><Plus className="size-3.5 mr-1" />Add</Button>
                        </div>
                        <div className="grid gap-2">
                          {attr.values.map((v) => (
                            <div key={v.id} className="flex items-center justify-between rounded-lg border p-2.5" style={{ borderColor: TOKENS.borderLight }}>
                              <div className="flex items-center gap-2.5 min-w-0">
                                {v.colorHex ? <span className="size-6 rounded-full border shrink-0" style={{ background: v.colorHex, borderColor: TOKENS.borderMid }} /> : <span className="size-6 rounded flex items-center justify-center border" style={{ background: TOKENS.bgPage, borderColor: TOKENS.borderLight }}><TypeIcon className="size-3" /></span>}
                                <div className="min-w-0"><p className="text-sm font-medium truncate" style={{ color: TOKENS.textPrimary }}>{v.name}</p><p className="text-xs truncate" style={{ color: TOKENS.textSecondary }}>{v.description}</p></div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button variant="ghost" size="icon" className="size-7 cursor-pointer" onClick={() => openEditValue(attr.id, v)}><Edit2 className="size-3.5" /></Button>
                                <DeleteDialog itemName={v.name} itemType="value" onDelete={async () => deleteValue(attr.id, v.id)} variant="ghost" size="icon" className="size-7 cursor-pointer" />
                              </div>
                            </div>
                          ))}
                          {attr.values.length === 0 && <p className="text-xs text-center py-4" style={{ color: TOKENS.textSecondaryLight }}>No values yet — tap Add to create one.</p>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Footer help */}
        <div className="mt-8 rounded-xl border bg-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderColor: TOKENS.borderLight, borderRadius: TOKENS.radiusMd }}>
          <div>
            <h4 className="text-sm font-semibold" style={{ color: TOKENS.textPrimary }}>How variations power your catalog</h4>
            <p className="text-xs mt-1 max-w-2xl" style={{ color: TOKENS.textSecondary }}>
              Create <strong>Variation Templates</strong> once, then reuse them when adding products. Each template (e.g., &quot;Abaya Size&quot;) generates consistent SKUs, pricing tiers, and inventory lines. Changes to a template&apos;s values propagate as suggestions in the product generator — no duplicate data entry.
            </p>
          </div>
          <Link href="/products/add" className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shrink-0 cursor-pointer shadow-sm" style={{ background: TOKENS.theme700, color: "white" }}>
            Go to Add Product <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Create / Edit Attribute Dialog */}
        <Dialog open={addOpen} onOpenChange={(o) => { if (!o) { setAddOpen(false); resetForm(); } }}>
          <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto" style={{ borderRadius: TOKENS.radiusMd }}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold" style={{ color: TOKENS.theme900 }}>{editingAttr ? "Edit variation template" : "Add variation template"}</DialogTitle>
              <DialogDescription className="text-sm" style={{ color: TOKENS.textSecondary }}>
                Define a reusable attribute that will appear in the product variant generator.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="variation-name" className="text-xs font-semibold" style={{ color: TOKENS.textPrimary }}>Variation name <span className="text-red-500">*</span></Label>
                <Input
                  id="variation-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Abaya Size (Length), Boutique Colorways"
                  className="h-10 rounded-lg"
                  style={{ borderColor: TOKENS.borderMid }}
                  autoFocus
                />
                <p className="text-[11px]" style={{ color: TOKENS.textSecondaryLight }}>Use sentence case • 3–40 characters recommended</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold" style={{ color: TOKENS.textPrimary }}>Category</Label>
                  <Select value={formCategory} onValueChange={(v) => setFormCategory(v as any)}>
                    <SelectTrigger className="h-10 rounded-lg cursor-pointer" style={{ borderColor: TOKENS.borderMid }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Abayas">Abayas</SelectItem>
                      <SelectItem value="Occasion Wear">Occasion Wear</SelectItem>
                      <SelectItem value="Fabrics & Silhouettes">Fabrics & Silhouettes</SelectItem>
                      <SelectItem value="Custom & Tailored">Custom & Tailored</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold" style={{ color: TOKENS.textPrimary }}>Display type</Label>
                  <Select value={formType} onValueChange={(v) => setFormType(v as any)}>
                    <SelectTrigger className="h-10 rounded-lg cursor-pointer" style={{ borderColor: TOKENS.borderMid }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text — free-form label</SelectItem>
                      <SelectItem value="color">Color — with hex swatch</SelectItem>
                      <SelectItem value="button">Button — pill selector</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="variation-desc" className="text-xs font-semibold" style={{ color: TOKENS.textPrimary }}>Description</Label>
                <Textarea
                  id="variation-desc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explain usage, sizing guide, or customer-facing help text…"
                  rows={3}
                  className="rounded-lg"
                  style={{ borderColor: TOKENS.borderMid }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold" style={{ color: TOKENS.textPrimary }}>Status</Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus("active")}
                    className={cn("flex-1 rounded-lg border py-2.5 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors", formStatus === "active" ? "text-white" : "bg-white hover:bg-[#EEF2F6]")}
                    style={{ borderColor: formStatus === "active" ? TOKENS.theme700 : TOKENS.borderLight, background: formStatus === "active" ? TOKENS.theme700 : "white" }}
                  >
                    <Eye className="size-4" /> Active — show in generator
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus("hidden")}
                    className={cn("flex-1 rounded-lg border py-2.5 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors", formStatus === "hidden" ? "text-white" : "bg-white hover:bg-[#EEF2F6]")}
                    style={{ borderColor: formStatus === "hidden" ? TOKENS.textSecondary : TOKENS.borderLight, background: formStatus === "hidden" ? TOKENS.textSecondary : "white" }}
                  >
                    <EyeOff className="size-4" /> Hidden — archive usage
                  </button>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setAddOpen(false); resetForm(); }} className="rounded-lg cursor-pointer" style={{ borderColor: TOKENS.borderLight }}>Cancel</Button>
              <Button onClick={handleSaveAttribute} className="rounded-lg cursor-pointer" style={{ background: TOKENS.theme700, color: "white" }}>{editingAttr ? "Save changes" : "Create variation"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add / Edit Value Dialog */}
        <Dialog open={!!valueDialogAttrId} onOpenChange={(o) => { if (!o) { setValueDialogAttrId(null); setEditingValue(null); } }}>
          <DialogContent className="sm:max-w-[520px]" style={{ borderRadius: TOKENS.radiusMd }}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold" style={{ color: TOKENS.theme900 }}>
                {editingValue ? "Edit value" : "Add value"} {valueDialogAttrId ? `• ${attributes.find((a) => a.id === valueDialogAttrId)?.name}` : ""}
              </DialogTitle>
              <DialogDescription className="sr-only">Manage variation value</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="val-name" className="text-xs font-semibold" style={{ color: TOKENS.textPrimary }}>Value name <span className="text-red-500">*</span></Label>
                <Input id="val-name" value={valName} onChange={(e) => setValName(e.target.value)} placeholder="e.g. Size 56, Onyx Black, Royal Nida" className="h-10 rounded-lg" style={{ borderColor: TOKENS.borderMid }} />
              </div>

              {attributes.find((a) => a.id === valueDialogAttrId)?.type === "color" && (
                <div className="space-y-2">
                  <Label htmlFor="val-hex" className="text-xs font-semibold" style={{ color: TOKENS.textPrimary }}>Color hex</Label>
                  <div className="flex items-center gap-2">
                    <div className="size-10 rounded-lg border shrink-0" style={{ background: valHex, borderColor: TOKENS.borderMid, borderRadius: TOKENS.radiusSm }} />
                    <Input id="val-hex" value={valHex} onChange={(e) => setValHex(e.target.value)} placeholder="#0A192F" className="h-10 rounded-lg flex-1" style={{ borderColor: TOKENS.borderMid }} />
                    <input type="color" value={valHex} onChange={(e) => setValHex(e.target.value)} className="size-10 cursor-pointer rounded-lg border p-1 bg-white" style={{ borderColor: TOKENS.borderMid }} aria-label="Color picker" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="val-desc" className="text-xs font-semibold" style={{ color: TOKENS.textPrimary }}>Description (optional)</Label>
                <Textarea id="val-desc" value={valDesc} onChange={(e) => setValDesc(e.target.value)} placeholder="e.g. 56″ length — ideal for height 5'6″ to 5'7″, Best seller, Deep luxury jet black…" rows={2} className="rounded-lg" style={{ borderColor: TOKENS.borderMid }} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setValueDialogAttrId(null); setEditingValue(null); }} className="rounded-lg cursor-pointer" style={{ borderColor: TOKENS.borderLight }}>Cancel</Button>
              <Button onClick={handleSaveValue} className="rounded-lg cursor-pointer" style={{ background: TOKENS.theme700, color: "white" }}>{editingValue ? "Save changes" : "Add value"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

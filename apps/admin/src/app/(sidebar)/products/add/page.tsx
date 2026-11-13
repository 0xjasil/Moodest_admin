import ProductFormLayout from "@/components/product/ConfigProductFormLayout";

export default function AddProductPage() {
  return (
    <div className="flex flex-1 flex-col min-h-screen">
      <div className="container flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6 py-4 md:py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Add New Product
              </h1>
            </div>
            <a href="/products/variations" className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3.5 py-2 text-xs font-medium hover:bg-[#EEF2F6]" style={{ borderColor: "#E3E8EF", color: "#004EEB" }}>
              Manage Variation Templates
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>

          {/* Product Form */}
          <ProductFormLayout />
        </div>
      </div>
    </div>
  );
}

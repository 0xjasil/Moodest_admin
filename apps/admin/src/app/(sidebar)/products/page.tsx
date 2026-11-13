import Link from "next/link";
import { Icon } from "@iconify/react";
import CommerceoProductList from "@/components/product/CommerceoProductList";

export const metadata = {
  title: "Products - Commerce Admin",
  description: "Manage products, stock status, pricing, categories and catalog",
};

export default function ProductPage() {
  return (
    <div className="flex flex-1 flex-col py-2 sm:py-4">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Products
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Manage product catalog, real-time stock toggles, pricing, and fulfillment status.
        </p>
      </div>

      <div className="mb-4 rounded-xl border bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderColor: "#E3E8EF", background: "#FFFFFF", borderRadius: "12px" }}>
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#EEF2F6" }}>
            <Icon icon="lucide:layers" className="size-5" style={{ color: "#004EEB" }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "#00359E" }}>Variation Templates</h3>
            <p className="text-xs mt-0.5" style={{ color: "#697586" }}>Manage reusable attributes — sizes, colors, fabrics — then apply them when adding products to auto-generate variants.</p>
          </div>
        </div>
        <Link href="/products/variations" className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 shrink-0" style={{ background: "#004EEB", borderRadius: "8px" }}>
          Manage Variations <Icon icon="lucide:arrow-right" className="size-4" />
        </Link>
      </div>

      <CommerceoProductList />
    </div>
  );
}

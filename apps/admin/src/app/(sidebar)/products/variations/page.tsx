import { Metadata } from "next";
import VariationTemplatesHub from "@/components/variations/VariationTemplatesHub";
export const metadata: Metadata = {
  title: "Variations • Products — Moodest Admin",
  description: "Manage variation templates — reusable attributes for size, color, fabrics, silhouettes. Power product variants with consistent SKUs.",
};

export default function VariationsPage() {
  return (
    <div className="flex flex-col gap-2 py-2 sm:py-4">
      <VariationTemplatesHub />
    </div>
  );
}

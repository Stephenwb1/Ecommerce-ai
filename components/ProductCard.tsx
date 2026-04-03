import { Product } from "@/types/product";
import ProductPlaceholderImage from "@/components/ProductPlaceholderImage";

const categoryBadge: Record<string, string> = {
  outerwear: "bg-zinc-200 text-zinc-700",
  tops: "bg-sky-100 text-sky-700",
  loungewear: "bg-amber-100 text-amber-700",
  accessories: "bg-emerald-100 text-emerald-700",
};

export default function ProductCard({ product }: { product: Product }) {
  const badge = categoryBadge[product.category] ?? "bg-zinc-100 text-zinc-600";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col">
      <ProductPlaceholderImage category={product.category} />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className={`text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded-full w-fit ${badge}`}>
          {product.category}
        </span>
        <p className="text-base font-semibold text-zinc-900 leading-snug">{product.name}</p>
        <p className="text-lg font-bold text-zinc-900">${product.price.toFixed(2)}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {product.sizes.map((size) => (
            <span
              key={size}
              className="text-xs border border-zinc-200 text-zinc-500 px-2 py-0.5 rounded-md"
            >
              {size}
            </span>
          ))}
        </div>
        <button
          type="button"
          className="mt-auto w-full bg-zinc-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-zinc-700 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

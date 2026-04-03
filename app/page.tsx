import products from "@/data/products.json";
import { Product } from "@/types/product";
import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-semibold text-zinc-900 mb-6">Our Collection</h2>
        <ProductGrid products={products as Product[]} />
      </main>
      <ChatWidget />
    </div>
  );
}

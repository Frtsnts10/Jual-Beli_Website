import { getProductBySlug } from "@/features/products/api";
import { Button } from "@heroui/react";
import Link from "next/link";
import { ShoppingCart, ArrowLeft, Star, Truck, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";

interface ProductPageProps {
  params: { slug: string };
}

// Ensure params are correctly awaited in Next.js 15+ if needed, but here assuming standard Next.js 14/15 approach
export default async function ProductPage({ params }: ProductPageProps) {
  // Await params for Next 15+ compatibility
  const slug = (await params).slug;
  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  return (
    <div className="flex-1 flex flex-col">

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20">
        <Link href="/products" className="inline-flex items-center text-sm text-neutral-400 hover:text-neutral-50 transition-colors mb-10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 aspect-square relative group">
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col pt-4 md:pt-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-medium">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price)}
              </span>
              <div className="flex items-center text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full text-sm font-medium">
                <Star className="w-4 h-4 fill-current mr-1" />
                4.9 (120 reviews)
              </div>
            </div>

            <p className="text-neutral-400 text-lg leading-relaxed mb-10">
              {product.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <AddToCartButton product={product} />
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 border-t border-neutral-800">
              <div className="flex items-start gap-4 text-neutral-300">
                <div className="bg-neutral-900 p-3 rounded-full">
                  <Truck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-50 text-sm mb-1">Free Shipping</h4>
                  <p className="text-xs text-neutral-500">On all orders over $100.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 text-neutral-300">
                <div className="bg-neutral-900 p-3 rounded-full">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-50 text-sm mb-1">2 Year Warranty</h4>
                  <p className="text-xs text-neutral-500">Guaranteed quality and support.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-800 px-6 py-8 text-center text-neutral-500 text-sm">
        <p>&copy; {new Date().getFullYear()} STORE. All rights reserved.</p>
      </footer>
    </div>
  );
}

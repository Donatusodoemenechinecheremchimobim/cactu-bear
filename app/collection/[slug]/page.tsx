"use client";

import { useParams } from "next/navigation";
import { useDB } from "@/store/useDB";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { formatNaira } from "@/lib/currency";
import { getCollectionWallpaper } from "@/lib/collectionWallpapers";

const LOCKED = ["season-2", "season-3"]; // lock the last 2 if you want

export default function CollectionPage() {
  const { slug } = useParams();
  const slugStr = typeof slug === "string" ? slug : "";

  const { products } = useDB();

  const isLocked = LOCKED.includes(slugStr.toLowerCase());

  const collectionProducts = products.filter((p) => {
    const col = (p.collection || "").toString();
    return col.toLowerCase().includes(slugStr.toLowerCase());
  });

  const wallpaper = getCollectionWallpaper(slugStr);

  return (
    <div className="min-h-screen pt-28 bg-black text-white pb-20">
      {/* Wallpaper header */}
      <div className="relative h-[320px] md:h-[420px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${wallpaper})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.10),transparent_55%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-black" />

        <div className="relative max-w-[1800px] mx-auto px-6 h-full flex flex-col justify-end pb-10">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-5 text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={14} /> Back to Archives
          </Link>

          <div className="flex items-end justify-between gap-6">
            <h1 className="text-4xl md:text-6xl font-semibold uppercase tracking-wider">
              {slugStr}
            </h1>

            {isLocked && (
              <div className="flex items-center gap-2 text-brand-neon uppercase tracking-widest text-xs">
                <Lock size={16} /> Locked Drop
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-6 mt-10">
        {isLocked ? (
          <div className="border border-white/10 bg-white/[0.02] p-16 text-center">
            <p className="text-white/60 uppercase tracking-widest text-xs">
              This collection is locked.
            </p>
          </div>
        ) : collectionProducts.length === 0 ? (
          <div className="py-20 text-center border border-white/10 bg-[#0a0a0a]">
            <p className="text-white/40 uppercase text-sm tracking-widest">
              No Products Found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {collectionProducts.map((product, i) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group relative bg-[#0a0a0a] border border-white/10 overflow-hidden hover:border-brand-neon/30 transition-all h-[500px] flex flex-col"
                >
                  <div className="relative h-[350px] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${product.images?.[0]})` }}
                    />
                    <div className="absolute inset-0 bg-black/25" />

                    {product.status === "sold-out" && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                        Sold Out
                      </div>
                    )}

                    {product.status === "pre-order" && (
                      <div className="absolute top-4 left-4 bg-brand-neon text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                        Pre-Order
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold uppercase mb-1 group-hover:text-brand-neon transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">
                        {product.category}
                      </p>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      <span className="text-white/80 font-medium">
                        {formatNaira(product.price)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

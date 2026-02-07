"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/types/product";
import { formatNaira } from "@/lib/currency";

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qy = query(collection(db, "products"), where("locked", "==", false));
    const unsub = onSnapshot(qy, (snap) => {
      const list: Product[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Product, "id">),
      }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setProducts(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const visible = useMemo(() => products.filter(Boolean), [products]);

  return (
    <div className="min-h-screen pt-28 px-6 bg-black text-white pb-20">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-4xl md:text-6xl uppercase tracking-[0.18em] mb-6">
          Store
        </h1>

        {loading ? (
          <div className="border border-white/10 bg-white/[0.02] p-12 text-white/60 uppercase tracking-widest text-xs">
            Loading products...
          </div>
        ) : visible.length === 0 ? (
          <div className="border border-white/10 bg-white/[0.02] p-12 text-white/60 uppercase tracking-widest text-xs">
            No products yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {visible.map((p) => {
              const img = p.variants?.[0]?.images?.[0] || p.images?.[0] || "";
              return (
                <Link key={p.id} href={`/product/${p.id}`}>
                  <div className="group border border-white/10 bg-[#0a0a0a] hover:border-brand-neon/30 transition-all overflow-hidden flex flex-col">
                    <div className="relative h-[220px] md:h-[360px] overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${img})` }}
                      />
                      <div className="absolute inset-0 bg-black/20" />
                    </div>

                    <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm md:text-lg uppercase tracking-wider text-white group-hover:text-brand-neon transition-colors">
                          {p.name}
                        </h3>
                        <div className="text-white/45 text-[10px] md:text-xs uppercase tracking-widest mt-2">
                          {p.category}
                        </div>
                      </div>

                      <div className="mt-4 text-white/90 text-sm md:text-base">
                        {formatNaira(p.price)}
                      </div>

                      <div className="mt-2 text-white/40 text-[10px] uppercase tracking-widest">
                        {(p.variants || []).map((v) => v.colorName).join(" • ")}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

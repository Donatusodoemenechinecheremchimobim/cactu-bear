"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product, ProductVariant } from "@/types/product";
import { formatNaira } from "@/lib/currency";
import { useStore } from "@/store/useStore";

export default function ProductPage() {
  const params = useParams();
  const id = String((params as any)?.id || "");

  const addToCart = useStore((s) => s.addToCart);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "products", id), (snap) => {
      if (!snap.exists()) {
        setProduct(null);
        setLoading(false);
        return;
      }
      const p = { id: snap.id, ...(snap.data() as Omit<Product, "id">) } as Product;
      setProduct(p);
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  const variants: ProductVariant[] = useMemo(() => {
    if (!product) return [];
    if (product.variants && product.variants.length > 0) return product.variants;
    if (product.images && product.images.length > 0) {
      return [{ colorName: "Default", images: product.images }];
    }
    return [];
  }, [product]);

  useEffect(() => {
    if (!product) return;

    // default selection so Add To Cart always works
    if (!selectedColor) setSelectedColor(variants[0]?.colorName || "Default");
    if (!selectedSize) setSelectedSize(product.sizes?.[0] || "One Size");
  }, [product, variants, selectedColor, selectedSize]);

  const activeVariant = useMemo(() => {
    return variants.find((v) => v.colorName === selectedColor) || variants[0];
  }, [variants, selectedColor]);

  const mainImage = activeVariant?.images?.[0] || product?.images?.[0] || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 px-6 pb-20">
        <div className="max-w-[1200px] mx-auto border border-white/10 bg-white/[0.02] p-10 text-white/60 uppercase tracking-widest text-xs">
          Loading product...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 px-6 pb-20">
        <div className="max-w-[1200px] mx-auto border border-white/10 bg-white/[0.02] p-10 text-white/60 uppercase tracking-widest text-xs">
          Product not found.
        </div>
      </div>
    );
  }

  const canBuy = product.status !== "sold-out";

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-6 pb-20">
      <div className="max-w-[1200px] mx-auto">
        {/* Mobile: side-by-side (2 columns). Desktop can expand later */}
        <div className="flex flex-row gap-4">
          {/* LEFT: IMAGE */}
          <div className="w-1/2 border border-white/10 bg-[#0a0a0a] overflow-hidden">
            <div className="aspect-[3/4] relative">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${mainImage})` }}
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Thumbnails */}
            <div className="p-3 flex gap-2 overflow-x-auto border-t border-white/10">
              {(activeVariant?.images || []).map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  className="w-14 h-14 flex-none border border-white/10 hover:border-brand-neon/40 transition overflow-hidden"
                  onClick={() => {
                    // bring clicked image to front (visual only)
                    const v = activeVariant;
                    if (!v) return;
                    const newImages = [...v.images];
                    const picked = newImages.splice(idx, 1)[0];
                    newImages.unshift(picked);

                    setProduct((prev) => {
                      if (!prev) return prev;
                      const old = prev.variants || [];
                      const updated = old.map((vv) =>
                        vv.colorName === v.colorName ? { ...vv, images: newImages } : vv
                      );
                      return { ...prev, variants: updated };
                    });
                  }}
                  aria-label="Preview image"
                >
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${img})` }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="w-1/2 border border-white/10 bg-white/[0.02] p-4">
            <h1 className="uppercase tracking-wider text-lg">{product.name}</h1>
            <div className="text-white/60 text-xs uppercase tracking-widest mt-2">
              {product.category} • {product.collectionSlug}
            </div>

            <div className="mt-4 text-white text-base">{formatNaira(product.price)}</div>

            <div className="mt-2 text-white/50 text-[10px] uppercase tracking-widest">
              Status: {product.status}
            </div>

            {product.description && (
              <p className="mt-4 text-white/70 text-sm leading-relaxed">
                {product.description}
              </p>
            )}

            {/* COLOR PICKER */}
            <div className="mt-6">
              <div className="text-white/60 text-xs uppercase tracking-widest mb-2">
                Color
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {variants.map((v) => {
                  const thumb = v.images?.[0] || "";
                  const active = v.colorName === selectedColor;
                  return (
                    <button
                      key={v.colorName}
                      onClick={() => setSelectedColor(v.colorName)}
                      className={`flex items-center gap-2 pr-3 border transition ${
                        active
                          ? "border-brand-neon/60 bg-brand-neon/10"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="w-10 h-10 border-r border-white/10 overflow-hidden">
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${thumb})` }}
                        />
                      </div>
                      <span className="uppercase tracking-widest text-[11px] text-white/80">
                        {v.colorName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SIZE PICKER */}
            <div className="mt-6">
              <div className="text-white/60 text-xs uppercase tracking-widest mb-2">
                Size
              </div>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || ["One Size"]).map((s) => {
                  const active = s === selectedSize;
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-2 border uppercase tracking-widest text-[11px] transition ${
                        active
                          ? "border-brand-neon/60 bg-brand-neon/10 text-brand-neon"
                          : "border-white/10 hover:border-white/30 text-white/80"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ADD TO CART */}
            <button
              disabled={!canBuy}
              className={`mt-7 w-full py-3 uppercase tracking-widest text-xs transition ${
                canBuy
                  ? "bg-brand-neon text-black hover:opacity-90"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              }`}
              onClick={() => {
                if (!product) return;
                if (!selectedSize || !selectedColor) return;
                addToCart(product, { size: selectedSize, color: selectedColor });
              }}
            >
              {product.status === "sold-out" ? "Sold Out" : product.status === "pre-order" ? "Pre-Order" : "Add to Cart"}
            </button>

            <div className="mt-3 text-white/40 text-[10px] uppercase tracking-widest">
              Selected: {selectedColor} / {selectedSize}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

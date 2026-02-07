"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useDB } from "@/store/useDB";
import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { ArrowRight, Scan, Lock } from "lucide-react";
import DropCountdown from "@/components/DropCountdown";
import GlitchImage from "@/components/GlitchImage";

export default function Home() {
  const { products, fetchProducts } = useDB();
  const { setQuickView } = useStore();
  const [mounted, setMounted] = useState(false);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, [fetchProducts]);

  if (!mounted) return <div className="bg-black min-h-screen" />;

  return (
    <div className="bg-black text-white overflow-hidden">
      {/* HERO SECTION */}
      <section className="h-screen w-full relative flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ y: y1, backgroundImage: "url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070')" }}
          className="absolute inset-0 bg-cover bg-center grayscale scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="border border-white/20 p-2 inline-block mb-6 backdrop-blur-sm"
          >
            <span className="text-brand-neon font-mono text-xs uppercase tracking-[0.4em] px-4">
              Collection 001 Live
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-[12vw] md:text-[10vw] leading-[0.85] font-black uppercase italic tracking-tighter mix-blend-overlay text-white drop-shadow-2xl"
          >
            Cactus
            <br />
            Bear
          </motion.h1>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8">
            <Link
              href="#shop"
              className="bg-white text-black px-10 py-5 font-black uppercase tracking-widest hover:bg-brand-neon transition-colors inline-flex items-center gap-2 text-sm hover:scale-105 duration-300"
            >
              Enter Store <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* TIMER */}
      <DropCountdown />

      {/* PRODUCTS */}
      <section id="shop" className="py-32 px-6 max-w-[1800px] mx-auto">
        <div className="flex justify-between items-end mb-16 border-b border-white/20 pb-4">
          <h2 className="text-4xl md:text-6xl font-black uppercase italic text-white/90">Latest Drop</h2>
          <span className="font-mono text-brand-neon hidden md:block">EST. 2025</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <div key={product.id} className="relative group">
              <Link href={`/product/${product.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#0a0a0a] border border-white/10 overflow-hidden hover:border-brand-neon/50 transition-colors duration-500 h-[500px] flex flex-col"
                >
                  <div className="relative h-[350px] overflow-hidden">
                    <GlitchImage src={product.images?.[0]} alt={product.name} />
                  </div>

                  <div className="p-6 relative flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-black uppercase italic mb-1 group-hover:text-brand-neon transition-colors leading-none">
                        {product.name}
                      </h3>
                      <p className="text-xs text-white/40 font-mono mt-1">
                        {product.collectionSlug || product.collection || "General"}
                      </p>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <span className="text-white/70 font-mono">₦{product.price}</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest border border-white/20 px-2 py-1 group-hover:bg-white group-hover:text-black transition-all">
                        Details
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setQuickView(product.id);
                }}
                className="absolute top-4 right-4 bg-black/80 backdrop-blur text-white p-3 opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-neon hover:text-black border border-white/20"
                title="Quick Scan"
              >
                <Scan size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(204,255,0,0.05),transparent_70%)]" />
        <div className="max-w-[1800px] mx-auto px-6 text-center relative z-10">
          <h1 className="text-[15vw] font-black uppercase opacity-10 leading-none select-none">Worldwide</h1>
          <div className="flex justify-center gap-8 mt-8 text-xs font-mono text-white/40 uppercase items-center">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Shipping</span>
            <Link href="/vault" className="hover:text-red-500 transition-colors flex items-center gap-1">
              <Lock size={10} /> Classified
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

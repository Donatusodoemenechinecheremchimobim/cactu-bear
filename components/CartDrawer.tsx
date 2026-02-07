"use client";

import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ArrowRight, ShoppingBag, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatNaira } from "@/lib/currency";

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  useEffect(() => setMounted(true), []);

  const { isCartOpen, toggleCart, cart, removeFromCart, updateQty } = useStore();

  if (!mounted) return null;

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleCheckout = () => {
    toggleCart();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-[#050505] border-l border-white/10 z-[60] flex flex-col shadow-2xl shadow-brand-neon/10"
          >
            <div className="flex justify-between items-center p-8 border-b border-white/5">
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                  Stash
                </h2>
                <span className="text-xs font-mono text-white/50">
                  {cart.length} ITEMS SECURED
                </span>
              </div>
              <button
                onClick={toggleCart}
                className="text-white hover:text-brand-neon transition-colors"
                aria-label="Close cart"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <div className="font-mono text-sm uppercase tracking-widest">
                    Nothing Here Yet
                  </div>
                </div>
              )}

              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 p-4 bg-white/5 border border-white/5 hover:border-brand-neon/30 transition-colors group"
                >
                  <div
                    className="w-24 h-24 bg-white/5 bg-cover bg-center border border-white/10"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold uppercase text-white leading-none mb-2 text-sm">
                        {item.name}
                      </h3>
                      <p className="text-white/40 text-[10px] font-mono tracking-wider">
                        SIZE: {item.size} | {item.color}
                      </p>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                      <div className="text-brand-neon font-mono text-sm">
                        {formatNaira(item.price)}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                        className="text-white/20 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        className="p-2 border border-white/10 hover:border-white/30 transition"
                        onClick={() =>
                          updateQty(item.productId, item.size, item.color, item.qty - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>

                      <div className="min-w-[34px] text-center text-white/70 font-mono">
                        {item.qty}
                      </div>

                      <button
                        className="p-2 border border-white/10 hover:border-white/30 transition"
                        onClick={() =>
                          updateQty(item.productId, item.size, item.color, item.qty + 1)
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="p-8 border-t border-white/10 bg-[#0a0a0a]">
                <div className="flex justify-between text-xl font-black mb-6 text-white font-mono">
                  <span>TOTAL</span>
                  <span>{formatNaira(total)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-brand-neon text-black font-black uppercase py-4 text-sm tracking-[0.2em] hover:bg-white hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                >
                  Proceed <ArrowRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ShoppingCart } from 'lucide-react';

const MESSAGES = [
    "User in Tokyo secured Grizzly Hoodie",
    "Stock Alert: Kodiak Vest critical in London",
    "New Order: Paris, FR",
    "User in NYC secured Dune Cargo Pant",
    "Traffic Spike: Lagos, NG - High Demand",
    "Sale Confirmed: Berlin - Oasis Tee",
    "User in Toronto secured Collection 001 Bundle",
    "Stock Alert: Size M sold out in Seoul"
];

export default function Radar() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-40 hidden lg:block">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 w-72 shadow-2xl">
            <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-brand-neon">
                    <ShoppingCart size={14} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Live Transactions</span>
                </div>
                <Globe size={14} className="text-white/30" />
            </div>
            
            <div className="h-12 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={msgIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.5 }}
                        className="text-xs font-mono text-white/90 leading-relaxed"
                    >
                        > {MESSAGES[msgIndex]}
                    </motion.div>
                </AnimatePresence>
            </div>
            
            <div className="mt-2 text-[9px] text-white/20 font-mono uppercase text-right">
                Verified Global Sales
            </div>
        </div>
    </div>
  );
}
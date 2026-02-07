"use client";
import { useStore } from '@/store/useStore';
import { useDB } from '@/store/useDB';
import { X, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuickViewModal() {
  const { quickViewId, setQuickView, addToCart, toggleCart } = useStore();
  const { products } = useDB();
  const product = products.find(p => p.id === quickViewId);
  const [size, setSize] = useState('');

  if (!quickViewId || !product) return null;

  const handleAdd = () => {
      if(!size) return alert('SELECT SIZE');
      addToCart(product, size, product.colors[0]);
      setQuickView(null);
      toggleCart();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setQuickView(null)} />
        
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0a0a0a] border border-white/20 w-full max-w-2xl relative shadow-2xl flex flex-col md:flex-row max-h-[80vh] overflow-hidden"
        >
            <button onClick={() => setQuickView(null)} className="absolute top-4 right-4 text-white z-10 hover:text-brand-neon"><X /></button>
            
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-cover bg-center" style={{ backgroundImage: `url(₦{product.images[0]})` }} />
            
            <div className="p-8 flex-1 flex flex-col">
                <span className="text-brand-neon text-xs font-mono mb-2 uppercase">/// Quick Scan</span>
                <h2 className="text-3xl font-black uppercase italic mb-4 leading-none">{product.name}</h2>
                <p className="text-2xl font-mono mb-6">₦{product.price}</p>
                
                <div className="mb-6">
                    <p className="text-[10px] font-bold uppercase text-white/50 mb-2">Select Size</p>
                    <div className="flex gap-2">
                        {['S', 'M', 'L', 'XL'].map(s => (
                            <button key={s} onClick={() => setSize(s)} className={`w-10 h-10 border text-xs font-bold ₦{size === s ? 'bg-white text-black' : 'border-white/20 text-white hover:border-white'}`}>{s}</button>
                        ))}
                    </div>
                </div>
                
                <button onClick={handleAdd} className="mt-auto w-full bg-brand-neon text-black font-black uppercase py-4 hover:bg-white transition-colors flex items-center justify-center gap-2">
                    Secure Item <ChevronRight size={16} />
                </button>
            </div>
        </motion.div>
    </div>
  );
}
"use client";
import { useState, useEffect } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntelPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success

  useEffect(() => {
    // Show after 5 seconds
    const timer = setTimeout(() => setIsOpen(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
      e.preventDefault();
      setStatus('loading');
      setTimeout(() => {
          setStatus('success');
          setTimeout(() => setIsOpen(false), 2000);
      }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
            initial={{ opacity: 0, y: 100 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 right-6 z-[100] w-[90vw] md:w-[400px]"
        >
            <div className="bg-black/90 border border-brand-neon/50 backdrop-blur-xl p-6 shadow-[0_0_30px_rgba(204,255,0,0.1)] relative">
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
                    <X size={18} />
                </button>

                <div className="flex items-center gap-3 mb-4 text-brand-neon">
                    <ShieldAlert size={24} className="animate-pulse" />
                    <h3 className="font-black uppercase italic text-xl tracking-tighter">Request Intel</h3>
                </div>

                {status === 'success' ? (
                    <div className="text-center py-6">
                        <p className="text-brand-neon font-mono text-sm uppercase tracking-widest">/// Clearance Granted</p>
                        <p className="text-white/50 text-xs mt-2">Check your inbox for codes.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-white/60 text-xs font-mono mb-6 leading-relaxed">
                            Join the inner circle. Secure early access to classified drops, secret sales, and limited edition prototypes.
                        </p>
                        <form onSubmit={handleSubscribe} className="flex gap-2">
                            <input 
                                type="email" 
                                required 
                                placeholder="ENTER EMAIL" 
                                className="bg-white/5 border border-white/20 p-3 text-white text-xs font-bold outline-none focus:border-brand-neon flex-1"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button className="bg-brand-neon text-black font-bold uppercase px-4 text-xs tracking-widest hover:bg-white transition-colors">
                                {status === 'loading' ? '...' : 'Join'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';
import Link from 'next/link';

export default function Vault() {
  const [input, setInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      if (input.toUpperCase() === 'BEAR') {
          setUnlocked(true);
      } else {
          alert('ACCESS DENIED. INVALID CREDENTIALS.');
          setInput('');
      }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6 flex flex-col items-center">
        <h1 className="text-[15vw] font-black uppercase italic text-[#0a0a0a] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">Classified</h1>
        
        <div className="relative z-10 w-full max-w-3xl">
            <div className="flex items-center gap-4 border-b-2 border-brand-neon pb-6 mb-12">
                {unlocked ? <Unlock className="text-brand-neon" size={40} /> : <Lock className="text-red-500" size={40} />}
                <div>
                    <h2 className="text-4xl font-black uppercase italic">The Vault</h2>
                    <p className="font-mono text-sm text-white/50">Friends & Family Clearance Only</p>
                </div>
            </div>

            {!unlocked ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto text-center">
                    <p className="font-mono text-xs uppercase mb-8 text-red-500 animate-pulse">/// Awaiting Passphrase</p>
                    <form onSubmit={handleUnlock} className="space-y-4">
                        <input 
                            type="password" 
                            className="w-full bg-transparent border-b border-white/30 text-center text-4xl font-black uppercase py-4 focus:border-brand-neon outline-none tracking-widest"
                            placeholder="ENTER CODE"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button className="bg-white text-black px-8 py-3 font-bold uppercase tracking-widest hover:bg-brand-neon transition-colors">Decrypt</button>
                    </form>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
                    {[1, 2].map((i) => (
                        <div key={i} className="border border-brand-neon/30 bg-[#050505] p-6 relative overflow-hidden group">
                            <div className="absolute top-4 right-4 text-xs font-mono text-brand-neon border border-brand-neon px-2 py-1">PROTOTYPE</div>
                            <div className="h-64 bg-gray-900 mb-6 flex items-center justify-center text-white/20 font-black text-5xl uppercase">Sample {i}</div>
                            <h3 className="text-2xl font-black uppercase italic">Unreleased Hoodie V{i}</h3>
                            <p className="font-mono text-white/50 mb-4">₦0.00 (F&F)</p>
                            <button className="w-full border border-white text-white py-3 uppercase font-bold hover:bg-white hover:text-black transition-colors">Claim</button>
                        </div>
                    ))}
                </motion.div>
            )}
        </div>
    </div>
  );
}
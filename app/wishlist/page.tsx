"use client"; 
import { useDB } from '@/store/useDB'; 
import Link from 'next/link'; 
import { Trash2, Heart, ArrowRight } from 'lucide-react'; 
import { motion } from 'framer-motion';

export default function Wishlist() { 
  const { wishlist, products, toggleWishlist } = useDB(); 
  const savedItems = products.filter(p => wishlist.includes(p.id)); 

  return (
    <div className="min-h-screen pt-32 px-6 bg-black text-white pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-end justify-between border-b border-white/10 pb-8 mb-12">
            <div>
                <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white">Saved Stash</h1>
                <p className="font-mono text-white/40 mt-2 text-xs uppercase tracking-widest">
                    {savedItems.length} Items Secured in Memory
                </p>
            </div>
            <Heart size={40} className="text-brand-neon animate-pulse" fill="currentColor" />
        </div>

        {/* Empty State */}
        {savedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-24 h-24 border border-white/10 flex items-center justify-center rounded-full mb-6">
                    <Heart size={32} className="text-white/20" />
                </div>
                <h2 className="text-2xl font-bold uppercase mb-4">Your Stash is Empty</h2>
                <Link href="/collections" className="bg-white text-black px-8 py-3 font-black uppercase tracking-widest hover:bg-brand-neon transition-colors flex items-center gap-2">
                    Start Scouting <ArrowRight size={16}/>
                </Link>
            </div>
        ) : (
            /* Grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {savedItems.map((p, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={p.id} 
                        className="group relative bg-[#0a0a0a] border border-white/10 hover:border-brand-neon/50 transition-colors"
                    >
                        <div className="h-96 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700" style={{ backgroundImage: `url(₦{p.images[0]})` }} />
                        
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic leading-none mb-1">{p.name}</h3>
                                    <p className="text-xs text-white/40 font-mono">{p.collection || 'General'}</p>
                                </div>
                                <span className="text-brand-neon font-mono text-lg">₦{p.price}</span>
                            </div>
                            
                            <div className="flex gap-2 mt-6">
                                <Link href={`/product/₦{p.id}`} className="flex-1 bg-white text-black py-3 text-center text-xs font-bold uppercase tracking-widest hover:bg-brand-neon transition-colors">
                                    Acquire
                                </Link>
                                <button onClick={() => toggleWishlist(p.id)} className="w-12 border border-white/20 flex items-center justify-center text-white/40 hover:text-red-500 hover:border-red-500 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
      </div>
    </div>
  ); 
}
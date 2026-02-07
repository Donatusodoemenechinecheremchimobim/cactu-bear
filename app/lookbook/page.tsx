"use client";
import { motion } from 'framer-motion';

const LOOKS = [
    { id: 1, title: "Desert Ops", img: "https://images.unsplash.com/photo-1509506692737-c7afc73a2143?q=80&w=2070" },
    { id: 2, title: "Urban Decay", img: "https://images.unsplash.com/photo-1617144788540-c3d0f0744033?q=80&w=2070" },
    { id: 3, title: "Night Watch", img: "https://images.unsplash.com/photo-1552160793-42eb480a02f4?q=80&w=2069" }
];

export default function Lookbook() {
  return (
    <div className="bg-black text-white">
        <div className="h-screen flex items-center justify-center relative">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542272617-08f08630329e?q=80&w=1974')] bg-cover bg-center opacity-40 grayscale" />
             <h1 className="relative z-10 text-[12vw] font-black uppercase italic tracking-tighter mix-blend-difference">Editorial</h1>
             <div className="absolute bottom-10 animate-bounce">Scroll to Explore</div>
        </div>

        {LOOKS.map((look, i) => (
            <motion.div 
                key={look.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="h-screen w-full relative flex items-center justify-center sticky top-0"
            >
                <div 
                    className="absolute inset-0 bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-1000"
                    style={{ backgroundImage: `url(₦{look.img})` }}
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 text-center">
                    <h2 className="text-6xl md:text-8xl font-black uppercase italic stroke-text text-transparent stroke-white">{look.title}</h2>
                    <button className="mt-8 bg-white text-black px-8 py-3 font-bold uppercase tracking-widest hover:bg-brand-neon transition-colors">Shop The Look</button>
                </div>
            </motion.div>
        ))}
    </div>
  );
}
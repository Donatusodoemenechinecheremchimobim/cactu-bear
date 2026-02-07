"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const collections = [
  {
    name: "Alpha Drop",
    slug: "alpha-drop",
    wallpaper: "/collections/alpha.jpg",
  },
  {
    name: "Desert Series",
    slug: "desert-series",
    wallpaper: "/collections/desert.jpg",
  },
  {
    name: "Midnight Ops",
    slug: "midnight-ops",
    wallpaper: "/collections/midnight.jpg",
  },
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen pt-28 px-6 bg-black text-white pb-20">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-4xl md:text-6xl font-semibold uppercase tracking-wide mb-14">
          Collections
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {collections.map((collection, i) => (
            <Link key={collection.slug} href={`/collection/${collection.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="group relative h-[420px] overflow-hidden border border-white/10 hover:border-white/40 transition-all"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${collection.wallpaper})`,
                  }}
                />

                {/* Tactical Overlay */}
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-all" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-end h-full p-6">
                  <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-wider">
                    {collection.name}
                  </h2>

                  <span className="text-xs uppercase tracking-[0.3em] text-white/60 mt-2">
                    Enter Sector →
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

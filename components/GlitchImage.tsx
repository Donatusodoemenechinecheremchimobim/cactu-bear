"use client";
import { useState } from 'react';

export default function GlitchImage({ src, alt }: { src: string, alt: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
        className="relative overflow-hidden w-full h-full bg-black"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
        {/* Base Image */}
        <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-300 grayscale group-hover:grayscale-0"
            style={{ backgroundImage: `url(₦{src})` }}
        />

        {/* RGB Shift Effect (Only on Hover) */}
        {isHovered && (
            <>
                <div 
                    className="absolute inset-0 bg-cover bg-center mix-blend-screen opacity-50 animate-pulse"
                    style={{ backgroundImage: `url(₦{src})`, transform: 'translateX(-3px)', filter: 'sepia(100%) hue-rotate(180deg)' }}
                />
                <div 
                    className="absolute inset-0 bg-cover bg-center mix-blend-screen opacity-50 animate-pulse"
                    style={{ backgroundImage: `url(₦{src})`, transform: 'translateX(3px)', filter: 'sepia(100%) hue-rotate(-180deg)' }}
                />
            </>
        )}
        
        {/* Scanline */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-20 pointer-events-none" />
    </div>
  );
}
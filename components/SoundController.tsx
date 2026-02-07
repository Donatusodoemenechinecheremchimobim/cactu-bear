"use client";
import { useEffect } from 'react';

// We use Web Audio API to generate tactical sounds without external files
export default function SoundController() {
  
  const playTone = (freq: number, type: 'sine' | 'square' | 'sawtooth', duration: number, vol: number = 0.1) => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  useEffect(() => {
    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('a') || target.closest('button')) {
         // High pitch short blip for hover
         playTone(800, 'sine', 0.05, 0.02);
      }
    };

    const handleClick = () => {
       // Lower mechanical thud for click
       playTone(150, 'square', 0.1, 0.05);
    };

    window.addEventListener('mouseover', handleHover);
    window.addEventListener('mousedown', handleClick);

    return () => {
      window.removeEventListener('mouseover', handleHover);
      window.removeEventListener('mousedown', handleClick);
    };
  }, []);

  return null; // Invisible component
}
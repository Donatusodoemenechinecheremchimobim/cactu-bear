"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function calc(msTarget: number): TimeLeft {
  const now = Date.now();
  const diff = msTarget - now;

  if (!Number.isFinite(msTarget) || msTarget <= 0 || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function DropCountdown() {
  const [mounted, setMounted] = useState(false);
  const [dropEndAt, setDropEndAt] = useState<number>(0);
  const [dropTitle, setDropTitle] = useState<string>("DROP INBOUND");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => setMounted(true), []);

  // Live Firestore settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "site"), (snap) => {
      const data: any = snap.data() || {};
      const ms = typeof data.dropEndAt === "number" ? data.dropEndAt : 0;
      const title = typeof data.dropTitle === "string" ? data.dropTitle : "DROP INBOUND";
      setDropEndAt(ms);
      setDropTitle(title);
    });
    return () => unsub();
  }, []);

  // Tick countdown
  useEffect(() => {
    if (!dropEndAt) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    setTimeLeft(calc(dropEndAt));
    const interval = setInterval(() => setTimeLeft(calc(dropEndAt)), 1000);
    return () => clearInterval(interval);
  }, [dropEndAt]);

  const done = useMemo(() => {
    return dropEndAt > 0 && Date.now() >= dropEndAt;
  }, [dropEndAt]);

  if (!mounted) return null;

  return (
    <div className="bg-[#050505] border-y border-white/10 py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 animate-pulse">
          <div className={`w-3 h-3 rounded-full ${done ? "bg-brand-neon" : "bg-red-500"}`} />
          <span className={`font-mono text-xs uppercase tracking-[0.2em] ${done ? "text-brand-neon" : "text-red-500"}`}>
            {done ? "DROP LIVE" : dropTitle}
          </span>
        </div>

        <div className="flex gap-8 font-black text-4xl md:text-6xl text-white font-mono leading-none">
          <div className="flex flex-col items-center">
            <span>{String(timeLeft.days).padStart(2, "0")}</span>
            <span className="text-[10px] font-sans font-normal text-white/30 uppercase tracking-widest">Days</span>
          </div>
          <span className="text-brand-neon animate-pulse">:</span>
          <div className="flex flex-col items-center">
            <span>{String(timeLeft.hours).padStart(2, "0")}</span>
            <span className="text-[10px] font-sans font-normal text-white/30 uppercase tracking-widest">Hrs</span>
          </div>
          <span className="text-brand-neon animate-pulse">:</span>
          <div className="flex flex-col items-center">
            <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
            <span className="text-[10px] font-sans font-normal text-white/30 uppercase tracking-widest">Mins</span>
          </div>
          <span className="text-brand-neon animate-pulse">:</span>
          <div className="flex flex-col items-center">
            <span className="text-brand-neon">{String(timeLeft.seconds).padStart(2, "0")}</span>
            <span className="text-[10px] font-sans font-normal text-white/30 uppercase tracking-widest">Secs</span>
          </div>
        </div>

        <div className="hidden md:block font-mono text-xs text-white/30 uppercase tracking-widest">
          /// Coordinates Locked
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ADMIN_EMAIL = "chibundusadiq@gmail.com";

export default function LoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string>("");

  // Only redirect if user is signed in AND we are not trying to switch accounts
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      const email = u?.email || "";
      setCurrentEmail(email);

      if (!u) return;

      if (email === ADMIN_EMAIL) router.replace("/admin");
      else router.replace("/store");
    });

    return () => unsub();
  }, [router]);

  const login = async () => {
    try {
      setBusy(true);
      const res = await signInWithPopup(auth, provider);

      const email = res.user?.email || "";
      if (email === ADMIN_EMAIL) router.replace("/admin");
      else router.replace("/store");
    } catch (err: any) {
      alert(err?.message || "Login failed");
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const switchAccount = async () => {
    try {
      setBusy(true);
      await signOut(auth);         // IMPORTANT: sign out first
      await login();               // then login again (forces chooser)
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-white/10 bg-white/[0.03] backdrop-blur-xl p-10">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="Cactus Bear"
            width={260}
            height={140}
            priority
            className="opacity-95"
          />
          <p className="mt-4 text-white/60 uppercase tracking-[0.25em] text-xs">
            Secure Member Access
          </p>
        </div>

        <button
          onClick={login}
          disabled={busy}
          className={`mt-10 w-full py-4 border border-white/20 uppercase tracking-[0.25em] text-xs transition-all
          ${busy ? "opacity-60 cursor-not-allowed" : "hover:bg-white hover:text-black"}`}
        >
          {busy ? "Signing in..." : "Continue with Google"}
        </button>

        {currentEmail && (
          <button
            onClick={switchAccount}
            disabled={busy}
            className="mt-4 w-full py-3 border border-white/10 text-white/70 uppercase tracking-[0.25em] text-[11px]
            hover:border-white/30 hover:text-white transition-all"
          >
            Use a different Google account
          </button>
        )}

        <p className="mt-6 text-center text-white/40 text-[11px] uppercase tracking-widest">
          chaos is luxury
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { useStore } from "@/store/useStore";
import { auth } from "@/lib/firebase";
import Logo from "./Logo";

const ADMIN_EMAIL = "chibundusadiq@gmail.com";

export default function Navbar() {
  const pathname = usePathname();
  const { cart, toggleCart } = useStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/95 backdrop-blur-xl py-3"
            : "bg-black/70 backdrop-blur-md py-6"
        }`}
      >
        <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-6 bg-gradient-to-b from-transparent to-black/40" />

        <div className="relative px-6 max-w-[1600px] mx-auto flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <Logo />
          </Link>

          <div className="hidden lg:flex items-center gap-12 text-sm uppercase tracking-[0.25em] text-white/90">
            <NavLink href="/store">Store</NavLink>
            <NavLink href="/collections">Collections</NavLink>
            <NavLink href="/manifesto">Manifesto</NavLink>
            <NavLink href="/wishlist">Wishlist</NavLink>
            {isAdmin && <NavLink href="/admin">Admin</NavLink>}
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href={isAdmin ? "/admin" : "/store"}
                  className="flex items-center gap-2 text-xs uppercase tracking-widest border border-white/15 px-4 py-2 hover:border-brand-neon/40 hover:text-brand-neon transition-all"
                >
                  <User size={14} />
                  <span className="max-w-[120px] truncate">
                    {user.displayName?.split(" ")[0] || "Account"}
                  </span>
                </Link>

                <button
                  onClick={() => signOut(auth)}
                  className="text-xs uppercase tracking-widest text-white/60 hover:text-brand-neon transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:block text-xs uppercase tracking-widest text-white/70 hover:text-brand-neon transition-colors"
              >
                Login
              </Link>
            )}

            <button onClick={toggleCart} className="relative group" aria-label="Cart">
              <ShoppingBag className="w-6 h-6 text-white group-hover:text-brand-neon transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-neon text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            <button onClick={() => setMobileOpen(true)} className="lg:hidden" aria-label="Open menu">
              <Menu size={26} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black"
            />

            <motion.aside
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="fixed top-0 right-0 z-50 h-full w-[86%] max-w-[380px] bg-black/92 backdrop-blur-2xl border-l border-white/10"
            >
              <div className="h-full p-7 flex flex-col">
                <div className="flex items-center justify-between">
                  <Logo />
                  <button
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                    className="p-2 rounded-full border border-white/10 hover:border-brand-neon/30 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="mt-8 flex flex-col gap-5">
                  <MobileItem href="/store" title="Store" subtitle="All products" />
                  <MobileItem href="/collections" title="Collections" subtitle="Browse drops" />
                  <MobileItem href="/manifesto" title="Manifesto" subtitle="Brand doctrine" />
                  <MobileItem href="/wishlist" title="Wishlist" subtitle="Saved intel" />
                  {isAdmin && <MobileItem href="/admin" title="Admin" subtitle="Control room" />}
                </div>

                <div className="mt-auto pt-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <div className="mt-6 flex flex-col gap-3">
                    {!user ? (
                      <Link
                        href="/login"
                        className="w-full text-center py-3 border border-white/15 uppercase tracking-[0.25em] text-[11px]
                        hover:bg-brand-neon hover:text-black transition-all"
                      >
                        Login
                      </Link>
                    ) : (
                      <>
                        <div className="text-white/60 text-xs uppercase tracking-widest">
                          Signed in as <span className="text-white/90">{user.email}</span>
                        </div>

                        <button
                          onClick={() => signOut(auth)}
                          className="w-full py-3 border border-white/15 uppercase tracking-[0.25em] text-[11px]
                          hover:bg-brand-neon hover:text-black transition-all"
                        >
                          Logout
                        </button>
                      </>
                    )}
                  </div>

                  <div className="mt-6 text-center text-brand-neon/60 text-[10px] uppercase tracking-[0.35em]">
                    chaos is luxury
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="relative group hover:text-brand-neon transition-colors">
      {children}
      <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-brand-neon transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

function MobileItem({ href, title, subtitle }: { href: string; title: string; subtitle: string }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4
      hover:border-brand-neon/25 hover:bg-white/[0.04] transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="uppercase tracking-widest text-sm text-white/90 group-hover:text-brand-neon transition-colors">
          {title}
        </div>
        <div className="h-[1px] w-10 bg-white/10 group-hover:bg-brand-neon/40 transition-colors" />
      </div>
      <div className="mt-2 text-white/50 text-xs uppercase tracking-[0.22em]">
        {subtitle}
      </div>
    </Link>
  );
}

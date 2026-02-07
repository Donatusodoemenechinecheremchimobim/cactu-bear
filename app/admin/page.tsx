"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Lock } from "lucide-react";

import { auth, db } from "@/lib/firebase";
import type { Product, ProductStatus, CollectionMeta, ProductVariant } from "@/types/product";

const ADMIN_EMAIL = "chibundusadiq@gmail.com";
type NoticeType = "error" | "success" | "info";

const EMPTY_PRODUCT_FORM = {
  name: "",
  price: "",
  category: "",
  collectionSlug: "season-1",
  description: "",
  status: "in-stock" as ProductStatus,
  locked: false,
  sizes: "S,M,L,XL",
  variantsText: "",
};

const EMPTY_COLLECTION_FORM = {
  slug: "season-1",
  name: "Season 1",
  wallpaper: "/wallpapers/collection-1.jpg",
  locked: false,
  unlockAt: "",
};

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<NoticeType>("info");

  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<CollectionMeta[]>([]);

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
  const [collectionForm, setCollectionForm] = useState(EMPTY_COLLECTION_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Homepage timer settings (Firestore: settings/site)
  const [dropTitle, setDropTitle] = useState("DROP INBOUND");
  const [dropEndAt, setDropEndAt] = useState("");

  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);

  function banner(type: NoticeType, msg: string) {
    setNoticeType(type);
    setNotice(msg);
    window.clearTimeout((banner as any)._t);
    (banner as any)._t = window.setTimeout(() => setNotice(""), 4500);
  }

  // ---------- helpers ----------
  const parseCSV = (s: string) =>
    (s || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const toNumber = (s: string) => {
    const n = Number(String(s).replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const dateTimeLocalToMs = (value: string) => {
    if (!value) return 0;
    const ms = new Date(value).getTime();
    return Number.isFinite(ms) ? ms : 0;
  };

  const msToLocalInput = (ms: number) => {
    if (!ms) return "";
    const d = new Date(ms);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  // Parse variants text: one per line: "Black | url1, url2"
  function parseVariants(text: string): ProductVariant[] {
    const lines = (text || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const variants: ProductVariant[] = [];
    for (const line of lines) {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length < 2) continue;
      const colorName = parts[0];
      const images = parts[1]
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      if (!colorName || images.length === 0) continue;
      variants.push({ colorName, images });
    }
    return variants;
  }

  function variantsToText(variants?: ProductVariant[]) {
    if (!variants || variants.length === 0) return "";
    return variants
      .map((v) => `${v.colorName} | ${(v.images || []).join(", ")}`)
      .join("\n");
  }

  // ---------- auth gate ----------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);

      if (!u) router.replace("/login");
      else if (u.email !== ADMIN_EMAIL) router.replace("/store");
    });

    return () => unsub();
  }, [router]);

  // ---------- live load products ----------
  useEffect(() => {
    if (!isAdmin) return;

    const qy = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const list: Product[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Product, "id">),
        }));
        setProducts(list);
      },
      (err) => banner("error", `Could not load products: ${err.message}`)
    );

    return () => unsub();
  }, [isAdmin]);

  // ---------- live load collections ----------
  useEffect(() => {
    if (!isAdmin) return;

    const unsub = onSnapshot(
      collection(db, "collections"),
      (snap) => {
        const list: CollectionMeta[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CollectionMeta, "id">),
        }));
        list.sort((a, b) => a.slug.localeCompare(b.slug));
        setCollections(list);
      },
      (err) => banner("error", `Could not load collections: ${err.message}`)
    );

    return () => unsub();
  }, [isAdmin]);

  // ---------- live load timer ----------
  useEffect(() => {
    if (!isAdmin) return;

    const unsub = onSnapshot(
      doc(db, "settings", "site"),
      (snap) => {
        const data: any = snap.data() || {};
        if (typeof data.dropTitle === "string") setDropTitle(data.dropTitle);
        if (typeof data.dropEndAt === "number") setDropEndAt(msToLocalInput(data.dropEndAt));
      },
      (err) => banner("error", `Could not load timer: ${err.message}`)
    );

    return () => unsub();
  }, [isAdmin]);

  // ---------- actions ----------
  const saveTimer = async () => {
    const ms = dateTimeLocalToMs(dropEndAt);
    if (!ms) return banner("error", "Pick a valid drop end date/time.");

    try {
      await setDoc(
        doc(db, "settings", "site"),
        { dropTitle: dropTitle.trim() || "DROP INBOUND", dropEndAt: ms, updatedAt: Date.now() },
        { merge: true }
      );
      banner("success", "Homepage timer saved.");
    } catch (err: any) {
      banner("error", err?.message || "Could not save timer.");
    }
  };

  const saveCollection = async () => {
    const slug = collectionForm.slug.trim().toLowerCase();
    if (!slug) return banner("error", "Collection slug is required.");

    const unlockAtMs = dateTimeLocalToMs(collectionForm.unlockAt);

    try {
      await setDoc(
        doc(db, "collections", slug),
        {
          slug,
          name: (collectionForm.name || slug).trim(),
          wallpaper: (collectionForm.wallpaper || "").trim() || "/wallpapers/collection-1.jpg",
          locked: !!collectionForm.locked,
          unlockAt: unlockAtMs || 0,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      banner("success", "Collection saved.");
    } catch (err: any) {
      banner("error", err?.message || "Could not save collection.");
    }
  };

  const loadCollectionIntoForm = (c: CollectionMeta) => {
    setCollectionForm({
      slug: c.slug,
      name: c.name,
      wallpaper: c.wallpaper,
      locked: !!c.locked,
      unlockAt: msToLocalInput(c.unlockAt),
    });
    banner("info", `Loaded ${c.slug}`);
  };

  const saveProduct = async () => {
    const name = productForm.name.trim();
    const price = toNumber(productForm.price);
    const category = productForm.category.trim();
    const collectionSlug = productForm.collectionSlug.trim().toLowerCase();
    const sizes = parseCSV(productForm.sizes);
    const variants = parseVariants(productForm.variantsText);

    if (!name) return banner("error", "Product name is required.");
    if (!collectionSlug) return banner("error", "Collection slug is required (e.g. season-1).");
    if (!category) return banner("error", "Category is required.");
    if (price <= 0) return banner("error", "Price must be valid.");
    if (sizes.length === 0) return banner("error", "Add at least one size (S,M,L...).");
    if (variants.length === 0)
      return banner("error", "Add at least one variant line: Black | url1, url2");

    const images = variants[0]?.images || [];
    const colors = variants.map((v) => v.colorName);

    try {
      const payload = {
        name,
        price,
        category,
        collectionSlug,
        description: productForm.description.trim(),
        status: productForm.status,
        locked: !!productForm.locked,
        sizes,
        variants,
        images,
        colors,
        updatedAt: Date.now(),
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), payload);
        banner("success", "Product updated.");
        setEditingId(null);
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: Date.now(),
        });
        banner("success", "Product added.");
      }

      setProductForm(EMPTY_PRODUCT_FORM);
    } catch (err: any) {
      banner("error", err?.message || "Could not save product.");
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setProductForm({
      name: p.name || "",
      price: String(p.price ?? ""),
      category: p.category || "",
      collectionSlug: p.collectionSlug || "season-1",
      description: p.description || "",
      status: p.status || "in-stock",
      locked: !!p.locked,
      sizes: (p.sizes || []).join(", "),
      variantsText: variantsToText(p.variants),
    });
    banner("info", "Editing product…");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setProductForm(EMPTY_PRODUCT_FORM);
    banner("info", "Edit cancelled.");
  };

  const removeProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      banner("success", "Product deleted.");
    } catch (err: any) {
      banner("error", err?.message || "Could not delete product.");
    }
  };

  const toggleProductLock = async (p: Product) => {
    try {
      await updateDoc(doc(db, "products", p.id), {
        locked: !p.locked,
        updatedAt: Date.now(),
      });
      banner("success", p.locked ? "Product unlocked." : "Product locked.");
    } catch (err: any) {
      banner("error", err?.message || "Could not update lock.");
    }
  };

  // ---------- guards ----------
  if (checking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Checking access...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Redirecting...
      </div>
    );
  }

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-black text-white pt-28 px-6 pb-20">
      <div className="max-w-[1500px] mx-auto">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl uppercase tracking-[0.2em]">Admin Control</h1>
            <p className="text-white/50 text-xs uppercase tracking-[0.25em] mt-2">
              Products • Variants • Collections • Timer
            </p>
          </div>
          <div className="text-brand-neon/70 text-xs uppercase tracking-widest">{user.email}</div>
        </header>

        {notice && (
          <div
            className={`mb-8 border px-5 py-4 uppercase tracking-widest text-xs ${
              noticeType === "error"
                ? "border-red-500/40 bg-red-500/10 text-red-300"
                : noticeType === "success"
                ? "border-brand-neon/30 bg-brand-neon/10 text-brand-neon"
                : "border-white/15 bg-white/[0.03] text-white/70"
            }`}
          >
            {notice}
          </div>
        )}

        {/* TIMER */}
        <section className="border border-white/10 bg-white/[0.02] p-6 md:p-8 mb-10">
          <h2 className="text-lg uppercase tracking-widest mb-6 text-brand-neon">
            Homepage Timer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Drop Title">
              <input
                value={dropTitle}
                onChange={(e) => setDropTitle(e.target.value)}
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
              />
            </Field>

            <Field label="Drop End Date/Time">
              <input
                type="datetime-local"
                value={dropEndAt}
                onChange={(e) => setDropEndAt(e.target.value)}
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
              />
            </Field>

            <button
              onClick={saveTimer}
              className="px-6 py-3 bg-brand-neon text-black uppercase tracking-widest text-xs hover:opacity-90 transition"
            >
              Save Timer
            </button>
          </div>
        </section>

        {/* COLLECTIONS */}
        <section className="border border-white/10 bg-white/[0.02] p-6 md:p-8 mb-10">
          <h2 className="text-lg uppercase tracking-widest mb-6 text-brand-neon">
            Collection Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Slug (doc id)">
              <input
                value={collectionForm.slug}
                onChange={(e) => setCollectionForm((s) => ({ ...s, slug: e.target.value }))}
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
              />
            </Field>

            <Field label="Name">
              <input
                value={collectionForm.name}
                onChange={(e) => setCollectionForm((s) => ({ ...s, name: e.target.value }))}
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
              />
            </Field>

            <Field label="Wallpaper (public path)">
              <input
                value={collectionForm.wallpaper}
                onChange={(e) =>
                  setCollectionForm((s) => ({ ...s, wallpaper: e.target.value }))
                }
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
              />
            </Field>

            <Field label="Unlock timer (optional)">
              <input
                type="datetime-local"
                value={collectionForm.unlockAt}
                onChange={(e) => setCollectionForm((s) => ({ ...s, unlockAt: e.target.value }))}
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
              />
            </Field>

            <div className="flex items-center gap-3">
              <input
                id="collectionLocked"
                type="checkbox"
                checked={collectionForm.locked}
                onChange={(e) => setCollectionForm((s) => ({ ...s, locked: e.target.checked }))}
                className="accent-[var(--brand-neon,#d6ff00)] w-4 h-4"
              />
              <label
                htmlFor="collectionLocked"
                className="uppercase tracking-widest text-xs text-white/80"
              >
                Lock this collection
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveCollection}
                className="px-6 py-3 bg-brand-neon text-black uppercase tracking-widest text-xs hover:opacity-90 transition"
              >
                Save Collection
              </button>

              <button
                onClick={() => setCollectionForm(EMPTY_COLLECTION_FORM)}
                className="px-6 py-3 border border-white/15 uppercase tracking-widest text-xs hover:border-white/30 transition"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-8">
            <div className="text-white/50 text-xs uppercase tracking-widest mb-3">
              Existing collections:
            </div>
            <div className="flex flex-wrap gap-3">
              {collections.map((c) => (
                <button
                  key={c.id}
                  onClick={() => loadCollectionIntoForm(c)}
                  className="px-4 py-2 border border-white/10 bg-white/[0.02] hover:border-brand-neon/30 transition text-xs uppercase tracking-widest"
                >
                  {c.slug}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="border border-white/10 bg-white/[0.02] p-6 md:p-8 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg uppercase tracking-widest text-brand-neon">
              {editingId ? "Edit Product" : "Add Product"}
            </h2>
            {editingId && (
              <button
                onClick={cancelEdit}
                className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Name">
              <input
                value={productForm.name}
                onChange={(e) => setProductForm((s) => ({ ...s, name: e.target.value }))}
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
              />
            </Field>

            <Field label="Price (₦)">
              <input
                value={productForm.price}
                onChange={(e) => setProductForm((s) => ({ ...s, price: e.target.value }))}
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
                placeholder="45000"
              />
            </Field>

            <Field label="Category">
              <input
                value={productForm.category}
                onChange={(e) => setProductForm((s) => ({ ...s, category: e.target.value }))}
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
                placeholder="Outerwear"
              />
            </Field>

            <Field label="Collection Slug (season-1)">
              <input
                value={productForm.collectionSlug}
                onChange={(e) =>
                  setProductForm((s) => ({ ...s, collectionSlug: e.target.value }))
                }
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
                placeholder="season-1"
              />
            </Field>

            <Field label="Status">
              <select
                value={productForm.status}
                onChange={(e) =>
                  setProductForm((s) => ({ ...s, status: e.target.value as ProductStatus }))
                }
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40 uppercase tracking-widest text-xs"
              >
                <option value="in-stock">In Stock</option>
                <option value="sold-out">Sold Out</option>
                <option value="pre-order">Pre-Order</option>
              </select>
            </Field>

            <Field label="Sizes (comma separated)">
              <input
                value={productForm.sizes}
                onChange={(e) => setProductForm((s) => ({ ...s, sizes: e.target.value }))}
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
                placeholder="S,M,L,XL"
              />
            </Field>

            <Field label="Color Variants (one per line)">
              <textarea
                value={productForm.variantsText}
                onChange={(e) =>
                  setProductForm((s) => ({ ...s, variantsText: e.target.value }))
                }
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40 min-h-[160px]"
                placeholder={`Black | https://img1, https://img2\nRed | https://img3, https://img4`}
              />
              <p className="text-white/40 text-xs mt-2">
                Format: <span className="text-white/70">Color | url1, url2</span>
              </p>
            </Field>

            <Field label="Description">
              <textarea
                value={productForm.description}
                onChange={(e) =>
                  setProductForm((s) => ({ ...s, description: e.target.value }))
                }
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40 min-h-[160px]"
              />
            </Field>

            <div className="flex items-center gap-3">
              <input
                id="locked"
                type="checkbox"
                checked={productForm.locked}
                onChange={(e) =>
                  setProductForm((s) => ({ ...s, locked: e.target.checked }))
                }
                className="accent-[var(--brand-neon,#d6ff00)] w-4 h-4"
              />
              <label htmlFor="locked" className="uppercase tracking-widest text-xs text-white/80">
                Lock product (hide from store)
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveProduct}
                className="px-6 py-3 bg-brand-neon text-black uppercase tracking-widest text-xs hover:opacity-90 transition"
              >
                {editingId ? "Update Product" : "Add Product"}
              </button>

              <button
                onClick={() => setProductForm(EMPTY_PRODUCT_FORM)}
                className="px-6 py-3 border border-white/15 uppercase tracking-widest text-xs hover:border-white/30 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* LIST */}
        <section className="border border-white/10 bg-white/[0.02] p-6 md:p-8">
          <h2 className="text-lg uppercase tracking-widest text-brand-neon mb-6">
            Products (Live)
          </h2>

          {products.length === 0 ? (
            <div className="text-white/60 uppercase tracking-widest text-xs">No products yet.</div>
          ) : (
            <div className="space-y-5">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="relative border border-white/10 bg-black/40 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 overflow-hidden"
                >
                  {/* LOCK WATERMARK */}
                  {p.locked && (
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.10]">
                        <Lock className="w-24 h-24 text-red-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/0 to-red-500/5" />
                    </div>
                  )}

                  <div className="relative">
                    <div className="uppercase tracking-wider text-base">
                      {p.name}
                      {p.locked && (
                        <span className="ml-2 text-[10px] uppercase tracking-widest bg-red-600/15 border border-red-600/30 text-red-200 px-2 py-1">
                          Locked
                        </span>
                      )}
                    </div>

                    <div className="text-white/60 text-sm mt-1">₦{p.price}</div>

                    <div className="text-white/40 text-xs mt-2 uppercase tracking-widest">
                      {p.collectionSlug} • {p.status}
                    </div>

                    <div className="text-white/40 text-xs mt-1">
                      Sizes: {(p.sizes || []).join(", ")} • Colors:{" "}
                      {(p.variants || []).map((v) => v.colorName).join(", ")}
                    </div>
                  </div>

                  <div className="relative flex flex-wrap gap-3">
                    <button
                      onClick={() => startEdit(p)}
                      className="px-4 py-2 border border-white/15 uppercase tracking-widest text-xs hover:border-brand-neon/30 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => toggleProductLock(p)}
                      className="px-4 py-2 border border-white/15 uppercase tracking-widest text-xs hover:border-brand-neon/30 transition"
                    >
                      {p.locked ? "Unlock" : "Lock"}
                    </button>

                    <button
                      onClick={() => removeProduct(p.id)}
                      className="px-4 py-2 border border-red-600/40 text-red-300 uppercase tracking-widest text-xs hover:border-red-500 hover:text-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-white/60 text-xs uppercase tracking-widest mb-2">{label}</div>
      {children}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import type { Product, ProductStatus, CollectionMeta } from "@/types/product";

const ADMIN_EMAIL = "chibundusadiq@gmail.com";

const EMPTY_PRODUCT_FORM = {
  name: "",
  price: "",
  images: "",
  category: "",
  collectionSlug: "season-1",
  description: "",
  status: "in-stock" as ProductStatus,
  locked: false,
  sizes: "S,M,L,XL",
  colors: "Black",
};

const EMPTY_COLLECTION_FORM = {
  slug: "season-1",
  name: "Season 1",
  wallpaper: "/wallpapers/collection-1.jpg",
  locked: false,
  unlockAt: "", // datetime-local
};

type NoticeType = "error" | "success" | "info";

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<CollectionMeta[]>([]);

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
  const [collectionForm, setCollectionForm] = useState(EMPTY_COLLECTION_FORM);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [notice, setNotice] = useState<string>("");
  const [noticeType, setNoticeType] = useState<NoticeType>("info");

  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);

  // ---------- Auth Gate ----------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);

      if (!u) router.replace("/login");
      else if (u.email !== ADMIN_EMAIL) router.replace("/store");
    });
    return () => unsub();
  }, [router]);

  // ---------- Load products ----------
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
      (err) => {
        setNoticeType("error");
        setNotice(`Could not load products: ${err.message}`);
      }
    );

    return () => unsub();
  }, [isAdmin]);

  // ---------- Load collections ----------
  useEffect(() => {
    if (!isAdmin) return;

    const unsub = onSnapshot(
      collection(db, "collections"),
      (snap) => {
        const list: CollectionMeta[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CollectionMeta, "id">),
        }));
        // stable sort
        list.sort((a, b) => a.slug.localeCompare(b.slug));
        setCollections(list);
      },
      (err) => {
        setNoticeType("error");
        setNotice(`Could not load collections: ${err.message}`);
      }
    );

    return () => unsub();
  }, [isAdmin]);

  // ---------- Helpers ----------
  const parseCSV = (s: string) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const parseImages = (s: string) =>
    s
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
    // datetime-local wants YYYY-MM-DDTHH:mm in local time
    const d = new Date(ms);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  const setBanner = (type: NoticeType, msg: string) => {
    setNoticeType(type);
    setNotice(msg);
    // auto clear after a bit
    window.clearTimeout((setBanner as any)._t);
    (setBanner as any)._t = window.setTimeout(() => setNotice(""), 4500);
  };

  // ---------- Product Save ----------
  const saveProduct = async () => {
    setNotice("");

    const name = productForm.name.trim();
    const collectionSlug = productForm.collectionSlug.trim().toLowerCase();
    const images = parseImages(productForm.images);
    const price = toNumber(productForm.price);
    const category = productForm.category.trim();

    if (!name) return setBanner("error", "Product name is required.");
    if (!collectionSlug) return setBanner("error", "Collection slug is required (e.g. season-1).");
    if (!images.length) return setBanner("error", "Add at least one image URL (comma separated).");
    if (price <= 0) return setBanner("error", "Price must be a valid number.");
    if (!category) return setBanner("error", "Category is required.");

    const payload = {
      name,
      price,
      images,
      category,
      collectionSlug,
      description: productForm.description.trim(),
      status: productForm.status,
      locked: !!productForm.locked,
      sizes: parseCSV(productForm.sizes),
      colors: parseCSV(productForm.colors),
      updatedAt: Date.now(),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), payload);
        setBanner("success", "Product updated.");
        setEditingId(null);
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: Date.now(),
        });
        setBanner("success", "Product added.");
      }

      setProductForm(EMPTY_PRODUCT_FORM);
    } catch (err: any) {
      setBanner("error", err?.message || "Could not save product.");
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setProductForm({
      name: p.name || "",
      price: String(p.price ?? ""),
      images: (p.images || []).join(", "),
      category: p.category || "",
      collectionSlug: p.collectionSlug || "season-1",
      description: p.description || "",
      status: p.status || "in-stock",
      locked: !!p.locked,
      sizes: (p.sizes || []).join(", "),
      colors: (p.colors || []).join(", "),
    });
    setBanner("info", "Editing product...");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setProductForm(EMPTY_PRODUCT_FORM);
    setBanner("info", "Edit cancelled.");
  };

  const removeProduct = async (id: string) => {
    setNotice("");
    // no browser confirm popup; do soft banner instead
    try {
      await deleteDoc(doc(db, "products", id));
      setBanner("success", "Product deleted.");
    } catch (err: any) {
      setBanner("error", err?.message || "Could not delete product.");
    }
  };

  const toggleProductLock = async (p: Product) => {
    try {
      await updateDoc(doc(db, "products", p.id), {
        locked: !p.locked,
        updatedAt: Date.now(),
      });
      setBanner("success", p.locked ? "Product unlocked." : "Product locked.");
    } catch (err: any) {
      setBanner("error", err?.message || "Could not update lock.");
    }
  };

  // ---------- Collection Save ----------
  const saveCollection = async () => {
    setNotice("");

    const slug = collectionForm.slug.trim().toLowerCase();
    if (!slug) return setBanner("error", "Collection slug is required.");

    const unlockAtMs = dateTimeLocalToMs(collectionForm.unlockAt);

    const payload: Omit<CollectionMeta, "id"> = {
      name: (collectionForm.name || slug).trim(),
      slug,
      wallpaper: (collectionForm.wallpaper || "").trim() || "/wallpapers/collection-1.jpg",
      locked: !!collectionForm.locked,
      unlockAt: unlockAtMs || 0,
    };

    try {
      await setDoc(doc(db, "collections", slug), payload, { merge: true });
      setBanner("success", "Collection settings saved.");
    } catch (err: any) {
      setBanner("error", err?.message || "Could not save collection settings.");
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
    setBanner("info", `Loaded ${c.slug}`);
  };

  // ---------- Guards ----------
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
              Products • Collections • Locks • Timers
            </p>
          </div>
          <div className="text-brand-neon/70 text-xs uppercase tracking-widest">
            {user.email}
          </div>
        </header>

        {/* Notice banner */}
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

        {/* COLLECTION SETTINGS */}
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
                placeholder="season-1"
              />
            </Field>

            <Field label="Name">
              <input
                value={collectionForm.name}
                onChange={(e) => setCollectionForm((s) => ({ ...s, name: e.target.value }))}
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
                placeholder="Season 1"
              />
            </Field>

            <Field label="Wallpaper (public path)">
              <input
                value={collectionForm.wallpaper}
                onChange={(e) => setCollectionForm((s) => ({ ...s, wallpaper: e.target.value }))}
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
                placeholder="/wallpapers/collection-1.jpg"
              />
              <p className="text-white/40 text-xs mt-2">
                Put images in <span className="text-white/70">public/wallpapers/</span>
              </p>
            </Field>

            <Field label="Unlock timer (optional)">
              <input
                type="datetime-local"
                value={collectionForm.unlockAt}
                onChange={(e) => setCollectionForm((s) => ({ ...s, unlockAt: e.target.value }))}
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
              />
              <p className="text-white/40 text-xs mt-2">Empty = no timer</p>
            </Field>

            <div className="flex items-center gap-3">
              <input
                id="collectionLocked"
                type="checkbox"
                checked={collectionForm.locked}
                onChange={(e) => setCollectionForm((s) => ({ ...s, locked: e.target.checked }))}
                className="accent-[var(--brand-neon,#d6ff00)] w-4 h-4"
              />
              <label htmlFor="collectionLocked" className="uppercase tracking-widest text-xs text-white/80">
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
              {collections.length === 0 && (
                <div className="text-white/40 text-xs uppercase tracking-widest">none yet</div>
              )}
            </div>
          </div>
        </section>

        {/* PRODUCT FORM */}
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
                placeholder="Desert Tactical Jacket"
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

            <Field label="Images (comma separated URLs)">
              <input
                value={productForm.images}
                onChange={(e) => setProductForm((s) => ({ ...s, images: e.target.value }))}
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
                placeholder="https://..., https://..."
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
                onChange={(e) => setProductForm((s) => ({ ...s, collectionSlug: e.target.value }))}
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

            <Field label="Colors (comma separated)">
              <input
                value={productForm.colors}
                onChange={(e) => setProductForm((s) => ({ ...s, colors: e.target.value }))}
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40"
                placeholder="Black,Sand"
              />
            </Field>

            <Field label="Description">
              <textarea
                value={productForm.description}
                onChange={(e) => setProductForm((s) => ({ ...s, description: e.target.value }))}
                className="w-full bg-black border border-white/15 px-4 py-3 outline-none focus:border-brand-neon/40 min-h-[120px]"
                placeholder="Short product description..."
              />
            </Field>

            <div className="flex items-center gap-3">
              <input
                id="locked"
                type="checkbox"
                checked={productForm.locked}
                onChange={(e) => setProductForm((s) => ({ ...s, locked: e.target.checked }))}
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

        {/* PRODUCTS LIST */}
        <section className="border border-white/10 bg-white/[0.02] p-6 md:p-8">
          <h2 className="text-lg uppercase tracking-widest text-brand-neon mb-6">
            Products (Live)
          </h2>

          {products.length === 0 ? (
            <div className="text-white/60 uppercase tracking-widest text-xs">
              No products yet. Add one above.
            </div>
          ) : (
            <div className="space-y-5">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="border border-white/10 bg-black/40 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                >
                  <div>
                    <div className="uppercase tracking-wider text-base">
                      {p.name}
                      {p.locked && (
                        <span className="ml-2 text-[10px] uppercase tracking-widest bg-white/10 px-2 py-1">
                          Locked
                        </span>
                      )}
                    </div>
                    <div className="text-white/60 text-sm mt-1">₦{p.price}</div>
                    <div className="text-white/40 text-xs mt-2 uppercase tracking-widest">
                      {p.collectionSlug} • {p.status}
                    </div>
                    <div className="text-white/40 text-xs mt-1">
                      Sizes: {(p.sizes || []).join(", ")} | Colors: {(p.colors || []).join(", ")}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
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

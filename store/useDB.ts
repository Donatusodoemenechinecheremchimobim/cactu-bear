import { create } from 'zustand';

export interface Product { 
    id: string; 
    name: string; 
    price: number; 
    category: string; 
    images: string[]; 
    colors: string[]; 
    sizes?: string[]; 
    collection?: string; 
    description?: string; 
}

interface DropSettings {
    dropTitle: string;
    dropDate: string;
}

interface DBState {
  products: Product[];
  wishlist: string[];
  dropSettings: DropSettings; // NEW
  
  fetchProducts: () => Promise<void>;
  fetchSettings: () => Promise<void>; // NEW
  updateSettings: (s: DropSettings) => Promise<void>; // NEW
  
  createProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleWishlist: (id: string) => void;
}

export const useDB = create<DBState>((set, get) => ({
  products: [],
  wishlist: [],
  dropSettings: { dropTitle: "Loading...", dropDate: new Date().toISOString() },

  fetchProducts: async () => { 
      try {
        const res = await fetch('/api/products'); 
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        set({ products: Array.isArray(data) ? data : [] }); 
      } catch (e) { set({ products: [] }); }
  },

  fetchSettings: async () => {
      try {
          const res = await fetch('/api/settings');
          if (res.ok) set({ dropSettings: await res.json() });
      } catch (e) { console.error(e); }
  },

  updateSettings: async (s) => {
      await fetch('/api/settings', { method: 'POST', body: JSON.stringify(s) });
      set({ dropSettings: s });
  },

  createProduct: async (p) => { 
      await fetch('/api/products', { method: 'POST', body: JSON.stringify(p) }); 
      get().fetchProducts(); 
  },

  deleteProduct: async (id) => { 
      await fetch(`/api/products?id=₦{id}`, { method: 'DELETE' }); 
      get().fetchProducts(); 
  },

  toggleWishlist: (id) => set(s => ({ wishlist: s.wishlist.includes(id) ? s.wishlist.filter(x => x !== id) : [...s.wishlist, id] })),
}));
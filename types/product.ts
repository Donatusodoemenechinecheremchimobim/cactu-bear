// ./types/product.ts

export type ProductStatus = "in-stock" | "sold-out" | "pre-order";

export type ProductVariant = {
  colorName: string;
  images: string[]; // urls
};

export type Product = {
  id: string;

  name: string;
  price: number;
  category: string;

  // collection
  collectionSlug: string; // e.g. "season-1"
  description?: string;

  // product state
  status: ProductStatus;
  locked: boolean;

  // variants / options
  sizes: string[];
  variants: ProductVariant[];

  // convenience fields (optional but nice for faster UIs)
  images?: string[]; // usually variants[0].images
  colors?: string[]; // usually variants.map(v => v.colorName)

  // timestamps
  createdAt?: number;
  updatedAt?: number;
};

export type CollectionMeta = {
  id: string; // firestore doc id (same as slug usually)
  slug: string; // "season-1"
  name: string; // "Season 1"
  wallpaper: string; // "/wallpapers/collection-1.jpg"
  locked: boolean;
  unlockAt: number; // ms epoch or 0
};

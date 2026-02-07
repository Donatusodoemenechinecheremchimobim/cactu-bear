export type ProductStatus = "in-stock" | "sold-out" | "pre-order";

export interface ProductVariant {
  colorName: string;
  images: string[];
  colorHex?: string;
}

export interface Product {
  id: string;

  name: string;
  price: number;

  category: string;
  collectionSlug: string;
  description?: string;

  status: ProductStatus;
  locked: boolean;

  sizes: string[];

  // legacy
  images: string[];

  // variants
  variants?: ProductVariant[];
  colors?: string[];

  createdAt: number;
  updatedAt: number;
}

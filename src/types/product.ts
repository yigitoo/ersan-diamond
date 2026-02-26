export type ProductCategory = "WATCH" | "HERMES";
export type ProductAvailability = "AVAILABLE" | "RESERVED" | "SOLD";
export type ProductCondition = "UNWORN" | "EXCELLENT" | "VERY_GOOD" | "GOOD" | "FAIR";

export interface ProductImage {
  url: string;
  alt: string;
  order: number;
}

export interface WatchSpecs {
  caseSize?: string;
  caseMaterial?: string;
  dialColor?: string;
  bracelet?: string;
  movement?: string;
  caliber?: string;
  waterResistance?: string;
  boxPapers?: "FULL_SET" | "BOX_ONLY" | "PAPERS_ONLY" | "NONE";
  serial?: string;
}

export interface HermesSpecs {
  size?: string;
  material?: string;
  color?: string;
  hardware?: string;
  stamp?: string;
  accessories?: string;
  dustbag?: boolean;
  box?: boolean;
}

export interface IProduct {
  _id: string;
  category: ProductCategory;
  brand: string;
  model: string;
  reference: string;
  year?: number;
  condition: ProductCondition;
  price?: number;
  currency: string;
  priceOnRequest: boolean;
  availability: ProductAvailability;
  title: string;
  description: string;
  specs: WatchSpecs | HermesSpecs;
  images: ProductImage[];
  slug: string;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

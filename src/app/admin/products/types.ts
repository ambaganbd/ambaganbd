// ── Admin Panel: Shared TypeScript Types ──────────────────────────
// Single source of truth for product-related types in the admin panel.

export interface Variant {
  id: string;
  name: string;
  regularPrice: number;
  deliveryCharge: number;
  image?: string;
}


export interface Product {
  id: string;
  name: string;
  /** Full / regular price (Optional, now managed by Packages) */
  regularPrice?: number;
  /** Sale price (Optional, now managed by Packages) */
  salePrice?: number;
  /** @deprecated Use regularPrice */
  price?: number;
  category: string;
  /** Main (hero) image URL */
  image: string;
  /** Extra gallery images */
  gallery?: string[];
  /** Short "About This Item" blurb */
  aboutItem?: string;
  /** Full product description */
  description: string;
  /** Product variants (colours, storage sizes, models…) */
  variants?: Variant[];
  /** Rating out of 5 */
  rating?: number;
  /** SEO & related product tags */
  tags?: string[];
}

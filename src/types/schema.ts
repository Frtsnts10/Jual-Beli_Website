export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
};

// Mapped from Dashboard InventoryItem
export type Product = {
  id: string;
  store_id: string;
  name: string;
  slug: string; // Dashboard doesn't enforce slug, we'll generate or use id
  description: string;
  price: number; // mapped from selling_price
  currency: string;
  images: string[];
  category_id: string;
  stock: number;
  created_at: string;
  updated_at: string;
  
  // Custom dashboard fields
  profile_tier?: string | null;
  category?: string | null;
  group_name?: string | null;
};

export type Store = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  currency: string;
  email: string;
  instagram: string;
  whatsapp: string;
  created_at: string;
};

import { Product } from "../actions/product-actions";
import { getProductImage } from "./product-assets";

export interface ProductGroup {
  id: string;
  name: string;
  basePrice: number;
  totalStock: number;
  category: string | null;
  variants: Product[];
  variantNames: string[];
  imageUrl: string;
}

export function groupProducts(products: Product[]): ProductGroup[] {
  const groups = new Map<string, ProductGroup>();
  
  for (const p of products) {
    // Force group by the first word of the product name to guarantee grouping
    const firstWord = p.name.trim().split(" ")[0].toUpperCase();
    const groupName = firstWord;
    
    if (!groups.has(groupName)) {
      groups.set(groupName, {
        id: groupName,
        name: p.name.trim().split(" ")[0], // Display just the first word
        basePrice: p.selling_price,
        totalStock: 0,
        category: p.category,
        variants: [],
        variantNames: [],
        imageUrl: getProductImage(groupName, p.category)
      });
    }
    
    const g = groups.get(groupName)!;
    
    // Fallback if profile_tier is missing, use the rest of the name
    const variantDetail = p.profile_tier?.trim() || p.name.substring(firstWord.length).trim() || "Standard";
    
    // Check if we already added a variant with this name
    const existingVariant = g.variants.find(v => v.name.toUpperCase() === variantDetail.toUpperCase());
    
    if (existingVariant) {
      existingVariant.stock += p.stock;
    } else {
      // Modify the product name to be the variant name for display in the modal
      const variantProduct = { ...p, name: variantDetail };
      g.variants.push(variantProduct);
      
      if (!g.variantNames.includes(variantDetail)) {
        g.variantNames.push(variantDetail);
      }
    }
    
    g.totalStock += p.stock;
    if (p.selling_price < g.basePrice) {
      g.basePrice = p.selling_price;
    }
  }
  
  // Sort groups by total stock descending
  return Array.from(groups.values()).sort((a, b) => b.totalStock - a.totalStock);
}

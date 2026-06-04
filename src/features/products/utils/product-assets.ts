/**
 * Premium assets mapper for Obsidian E-commerce Storefront.
 * Maps products to gorgeous, ultra-high-definition, dark-ambient 3D renders from Unsplash
 * to achieve an elite luxury branding style.
 */
export function getProductImage(productName: string, category: string | null): string {
  const name = productName.toLowerCase();
  const cat = (category || "").toLowerCase();

  // 1. Biometric / Auth / Access Keys (Cyberpunk neon grid and glowing security matrices)
  if (
    name.includes("key") || 
    name.includes("auth") || 
    name.includes("pass") || 
    name.includes("identity") || 
    name.includes("access")
  ) {
    return "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop";
  }

  // 2. Protocol / Core / System Drivers (Metallic liquid gold and high-end 3D mechanics)
  if (
    name.includes("core") || 
    name.includes("system") || 
    name.includes("protocol") || 
    name.includes("driver")
  ) {
    return "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop";
  }

  // 3. Shards / Crystals / Vault Matrices (Dark obsidian glass crystal shards)
  if (
    name.includes("shard") || 
    name.includes("crystal") || 
    name.includes("matrix") || 
    name.includes("vault")
  ) {
    return "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600&auto=format&fit=crop";
  }

  // 4. Software License / Protocol Nodes (Sleek carbon fiber glass smart card)
  if (
    cat.includes("software") || 
    cat.includes("license") || 
    name.includes("license") || 
    name.includes("node")
  ) {
    return "https://images.unsplash.com/photo-1618005198143-e5283b519a7f?q=80&w=600&auto=format&fit=crop";
  }

  // 5. Default Premium Premium 3D Liquid Artwork (Luxury floating mercury orb)
  return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";
}

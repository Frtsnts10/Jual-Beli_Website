import * as admin from "firebase-admin";

// You may need to load the service account manually if not using default credentials
// but let's try the existing server initialization
import { adminDb } from "../src/lib/firebase/server";

async function seed() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID || "default";
  
  const products = [
    // Netflix
    { name: "Netflix 1 User", selling_price: 35000, stock: 10, category: "Streaming" },
    { name: "Netflix 2 Users", selling_price: 65000, stock: 5, category: "Streaming" },
    { name: "Netflix Semi Private", selling_price: 85000, stock: 2, category: "Streaming" },
    { name: "Netflix Private", selling_price: 150000, stock: 1, category: "Streaming" },
    
    // Capcut
    { name: "Capcut 1 User", selling_price: 20000, stock: 15, category: "Editing" },
    { name: "Capcut 2 Users", selling_price: 35000, stock: 8, category: "Editing" },
    
    // Canva
    { name: "Canva Pro 1 Month", selling_price: 15000, stock: 20, category: "Design" },
    { name: "Canva Pro 1 Year", selling_price: 120000, stock: 5, category: "Design" }
  ];

  try {
    const inventoryRef = adminDb.collection("inventory");
    
    // Get existing to delete them (optional, but keeps it clean)
    const existing = await inventoryRef.where("store_id", "==", storeId).get();
    const batch = adminDb.batch();
    
    existing.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    products.forEach((p) => {
      const newRef = inventoryRef.doc();
      batch.set(newRef, {
        ...p,
        store_id: storeId,
        created_at: new Date().toISOString()
      });
    });

    await batch.commit();
    console.log("Successfully seeded database with variants!");
  } catch (e) {
    console.error("Error seeding:", e);
  }
}

seed();

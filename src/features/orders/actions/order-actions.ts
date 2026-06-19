"use server";

import { adminDb, getAuthenticatedUser } from "@/lib/firebase/server";

export interface PurchasedProduct {
  name: string;
  variant: string;
  duration_days: number;
  bought_date: string;
  expire_date: string;
  status?: string;
  banned_reason?: string;
}

export async function getCustomerOrdersAction(storeId: string) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Unauthenticated" };

  // 1. Fetch live orders
  const ordersSnap = await adminDb.collection("orders")
    .where("store_id", "==", storeId)
    .where("customer_email", "==", user.email)
    .orderBy("created_at", "desc")
    .get();

  const orders = ordersSnap.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id,
      created_at: d.created_at,
      items: Array.isArray(d.items) ? d.items : [],
      total_amount: Number(d.total_amount || 0),
      payment_status: d.payment_status,
      fulfillment_status: d.fulfillment_status,
    };
  });

  // 2. Fetch Customer profile
  const custSnap = await adminDb.collection("customers")
    .where("store_id", "==", storeId)
    .where("email", "==", user.email)
    .limit(1)
    .get();

  const customer = custSnap.empty ? { email: user.email, name: "", phone: "" } : custSnap.docs[0].data();
  const purchasedProducts = Array.isArray(customer.purchased_products) ? customer.purchased_products : [];

  // 3. Enrich purchased products with live warehouse credentials
  const enrichedProducts = await Promise.all(
    purchasedProducts.map(async (prod: any) => {
      if (prod.inventory_id) {
        const invDoc = await adminDb.collection("inventory").doc(prod.inventory_id).get();
        if (invDoc.exists) {
          const inv = invDoc.data()!;
          return {
            ...prod,
            credentials: {
              email: inv.email || "",
              password: inv.password || "",
              pin: inv.pin || "",
              group_assigned: inv.group_name || prod.group_assigned || ""
            }
          };
        }
      }
      return prod;
    })
  );

  return {
    customer: {
      id: custSnap.empty ? null : custSnap.docs[0].id,
      name: customer.name || user.name || "",
      email: customer.email || user.email,
      phone: customer.phone || "",
    },
    purchased_products: enrichedProducts,
    total_orders: customer.total_orders || 0,
    orders
  };
}

export async function checkoutAction(
  storeId: string, 
  items: PurchasedProduct[],
  cartItems?: { id: string; quantity: number }[]
) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Unauthenticated" };

  // Get current customer record
  const custSnap = await adminDb.collection("customers")
    .where("store_id", "==", storeId)
    .where("email", "==", user.email)
    .limit(1)
    .get();

  const existingCustomer = custSnap.empty ? null : { id: custSnap.docs[0].id, ...custSnap.docs[0].data() };

  const existingProducts = (existingCustomer as any)?.purchased_products || [];
  const newProducts = [...existingProducts, ...items];
  const newTotalOrders = ((existingCustomer as any)?.total_orders || 0) + items.length;

  let resolvedCustomerId = existingCustomer?.id || null;
  const customerName = (existingCustomer as any)?.name || user.name || user.email?.split('@')[0] || "Valued Customer";

  if (existingCustomer?.id) {
    // Update existing customer
    await adminDb.collection("customers").doc(existingCustomer.id).update({
      purchased_products: newProducts,
      total_orders: newTotalOrders,
    });
  } else {
    // Insert new customer
    const newCustRef = adminDb.collection("customers").doc();
    await newCustRef.set({
      id: newCustRef.id,
      store_id: storeId,
      name: customerName,
      email: user.email,
      purchased_products: newProducts,
      total_orders: newTotalOrders,
      created_at: new Date().toISOString(),
    });
    resolvedCustomerId = newCustRef.id;
  }

  // Decrement inventory stock and calculate total
  let totalPaidAmount = 0;
  if (cartItems && cartItems.length > 0) {
    for (const cartItem of cartItems) {
      const prodDoc = await adminDb.collection("inventory").doc(cartItem.id).get();
      if (prodDoc.exists) {
        const prod = prodDoc.data()!;
        const itemPrice = Number(prod.selling_price || prod.price || 0);
        totalPaidAmount += itemPrice * cartItem.quantity;
        const nextStock = Math.max(0, (prod.stock || 0) - cartItem.quantity);
        await adminDb.collection("inventory").doc(cartItem.id).update({ stock: nextStock });
      }
    }
  }

  // Fallback price calculation
  if (totalPaidAmount === 0 && items.length > 0) {
    const firstItem = items[0];
    const prodSnap = await adminDb.collection("inventory")
      .where("store_id", "==", storeId)
      .where("profile_tier", "==", firstItem.variant)
      .limit(1)
      .get();

    if (!prodSnap.empty) {
      const prod = prodSnap.docs[0].data();
      const itemPrice = Number(prod.selling_price || prod.price || 0);
      totalPaidAmount = itemPrice * items.length;
    }
  }

  // Register transaction in orders collection
  const orderRef = adminDb.collection("orders").doc();
  await orderRef.set({
    id: orderRef.id,
    store_id: storeId,
    customer_id: resolvedCustomerId,
    customer_name: customerName,
    customer_email: user.email,
    items: items.map(i => ({
      name: i.name,
      variant: i.variant,
      duration_days: i.duration_days,
      bought_date: i.bought_date,
      expire_date: i.expire_date,
    })),
    total_amount: totalPaidAmount,
    payment_status: "paid",
    fulfillment_status: "pending",
    created_at: new Date().toISOString(),
  });

  return { success: true };
}

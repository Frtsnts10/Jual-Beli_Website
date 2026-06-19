import { NextResponse } from "next/server";
// @ts-ignore
import midtransClient from "midtrans-client";
import { adminDb, getAuthenticatedUser } from "@/lib/firebase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, customerDetails, storeId } = body;
    
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "You must be logged in to checkout" }, { status: 401 });
    }
    
    if (!user.email_verified) {
      return NextResponse.json({ error: "Please verify your email address before purchasing products. Check your inbox for the verification link." }, { status: 403 });
    }

    const activeStoreId = storeId || process.env.NEXT_PUBLIC_STORE_ID;
    if (!activeStoreId) {
      return NextResponse.json({ error: "Missing store context" }, { status: 400 });
    }

    // Fetch Tenant's Midtrans Keys
    const storeDoc = await adminDb.collection("stores").doc(activeStoreId).get();
    if (!storeDoc.exists) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    const storeData = storeDoc.data();
    const serverKey = storeData?.api_keys?.midtrans_server_key || process.env.MIDTRANS_SERVER_KEY;
    const clientKey = storeData?.api_keys?.midtrans_client_key || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    if (!serverKey) {
      return NextResponse.json({ error: "Store hasn't configured Midtrans" }, { status: 400 });
    }

    // Initialize Midtrans Snap API dynamically
    const snap = new midtransClient.Snap({
      isProduction: process.env.NODE_ENV === "production" && !!process.env.MIDTRANS_IS_PRODUCTION,
      serverKey: serverKey.trim(),
      clientKey: (clientKey || "dummy").trim(),
    });

    // Re-verify prices securely from the database to prevent stale/malicious prices
    let grossAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const productDoc = await adminDb.collection("inventory").doc(item.id).get();
      if (!productDoc.exists) {
        return NextResponse.json({ error: `Product ${item.name} is no longer available.` }, { status: 400 });
      }
      
      const productData = productDoc.data();
      const realPrice = productData?.selling_price || 0;
      
      grossAmount += realPrice * item.quantity;
      
      validatedItems.push({
        id: item.id,
        price: realPrice,
        quantity: item.quantity,
        name: item.name.substring(0, 50),
      });
    }
    
    if (grossAmount <= 0) {
      return NextResponse.json({ error: "Order total must be greater than Rp 0 to proceed with Midtrans payment." }, { status: 400 });
    }

    const orderId = `ORD-${Date.now()}`;

    // Create PENDING Order in Database
    const orderRef = adminDb.collection("orders").doc(orderId);
    await orderRef.set({
      id: orderId,
      store_id: activeStoreId,
      customer_name: customerDetails?.name || "Customer",
      customer_email: customerDetails?.email || "customer@example.com",
      customer_phone: customerDetails?.phone || "",
      items: validatedItems,
      total_amount: grossAmount,
      payment_status: "pending",
      fulfillment_status: "pending",
      created_at: new Date().toISOString(),
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: validatedItems,
      customer_details: {
        first_name: customerDetails?.name || "Customer",
        email: customerDetails?.email || "customer@example.com",
        phone: customerDetails?.phone || "",
      },
      custom_field1: activeStoreId, // Store ID for webhook routing
    };

    const transaction = await snap.createTransaction(parameter);
    
    return NextResponse.json({ token: transaction.token, redirect_url: transaction.redirect_url, orderId });
  } catch (error: any) {
    console.error("Midtrans Error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction", details: error.message },
      { status: 500 }
    );
  }
}

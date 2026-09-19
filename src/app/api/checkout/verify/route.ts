import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/server";
// @ts-ignore
import midtransClient from "midtrans-client";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Fetch the order
    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderDoc.data();
    if (orderData?.payment_status === "paid") {
      return NextResponse.json({ success: true, message: "Order already paid" });
    }

    // The order carries the store it was placed against, so the client
    // doesn't need to know or send a store id at all.
    const storeId = orderData?.store_id;
    if (!storeId) {
      return NextResponse.json({ error: "Order has no associated store" }, { status: 400 });
    }

    // Fetch Midtrans keys
    const storeDoc = await adminDb.collection("stores").doc(storeId).get();
    const storeData = storeDoc.data();
    const serverKey = storeData?.api_keys?.midtrans_server_key || process.env.MIDTRANS_SERVER_KEY;
    
    if (!serverKey) {
      return NextResponse.json({ error: "No Midtrans key" }, { status: 400 });
    }

    // Initialize Midtrans Core API to check status
    const coreApi = new midtransClient.CoreApi({
      isProduction: process.env.NODE_ENV === "production" && !!process.env.MIDTRANS_IS_PRODUCTION,
      serverKey: serverKey.trim(),
      clientKey: "dummy"
    });

    try {
      const statusResponse = await coreApi.transaction.status(orderId);
      
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      if (
        transactionStatus === "capture" || 
        transactionStatus === "settlement"
      ) {
        if (fraudStatus === "challenge") {
          return NextResponse.json({ success: true, status: "challenge" });
        } else {
          // Success! Mark as paid.
          await adminDb.collection("orders").doc(orderId).update({
            payment_status: "paid",
            updated_at: new Date().toISOString()
          });
          
          // Here you could also call fulfillment logic (decrement stock, add to customer purchased_products)
          // For now, we just mark it paid so it shows on the profile!
          
          return NextResponse.json({ success: true, status: "paid" });
        }
      }
      
      return NextResponse.json({ success: true, status: transactionStatus });
      
    } catch (apiError: any) {
      console.error("Midtrans API Verification Error:", apiError);
      
      // If running on localhost and API errors out (like 404 because sandbox is slow), 
      // we can optionally forcefully mark it paid just for developer testing since they called verify directly.
      if (process.env.NODE_ENV === "development") {
         await adminDb.collection("orders").doc(orderId).update({
            payment_status: "paid",
            updated_at: new Date().toISOString()
         });
         return NextResponse.json({ success: true, status: "paid (dev override)" });
      }

      return NextResponse.json({ error: "Failed to verify with Midtrans" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

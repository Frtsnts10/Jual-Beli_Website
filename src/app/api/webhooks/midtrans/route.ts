import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/server";
import crypto from "crypto";
import { getStoreAction } from "@/features/stores/actions/store-actions";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // The storeId is passed via custom_field1 from the checkout API
    const storeId = payload.custom_field1;
    if (!storeId) {
      return NextResponse.json({ error: "Missing storeId in custom_field1" }, { status: 400 });
    }

    // Fetch tenant's Midtrans Keys to verify signature
    const storeDoc = await adminDb.collection("stores").doc(storeId).get();
    if (!storeDoc.exists) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    
    const storeData = storeDoc.data()!;
    const serverKey = storeData.api_keys?.midtrans_server_key;

    if (!serverKey) {
      return NextResponse.json({ error: "Store has no Midtrans server key configured" }, { status: 400 });
    }

    // Verify Midtrans Signature
    const orderId = payload.order_id;
    const statusCode = payload.status_code;
    const grossAmount = payload.gross_amount;
    
    const signatureKey = crypto.createHash('sha512').update(orderId + statusCode + grossAmount + serverKey).digest('hex');
    
    if (signatureKey !== payload.signature_key) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const transactionStatus = payload.transaction_status;
    const fraudStatus = payload.fraud_status;

    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      console.error(`Order ${orderId} not found in database.`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderDoc.data()!;

    if (
      transactionStatus == 'capture' || 
      transactionStatus == 'settlement'
    ) {
      if (Math.round(order.total_amount) !== Math.round(Number(grossAmount))) {
        console.error(`Order ${orderId} amount mismatch. Expected ${order.total_amount}, got ${grossAmount}`);
        await orderRef.update({
          payment_status: "amount_mismatch",
          midtrans_transaction_id: payload.transaction_id
        });
      } else if (fraudStatus == 'challenge') {
        console.log(`Order ${orderId} challenged by FDS`);
        // Maybe update payment status to challenged, but let's keep it pending for manual review
        await orderRef.update({
          payment_status: "challenged",
          midtrans_transaction_id: payload.transaction_id
        });
      } else {
        // Success! Update Order to PAID
        await orderRef.update({
          payment_status: "paid",
          midtrans_transaction_id: payload.transaction_id,
          paid_at: new Date().toISOString()
        });

        // -------------------------------------------------------------
        // TODO: Auto-Fulfillment Logic (Decrement stock, assign shards)
        // -------------------------------------------------------------
        
        // Very basic stock deduction since we don't have the full shards allocation here yet
        // In a complete implementation, this should allocate digital credentials based on `inventory` shards
        if (order.fulfillment_status === "pending" && Array.isArray(order.items)) {
          for (const item of order.items) {
            const invDoc = await adminDb.collection("inventory").doc(item.id).get();
            if (invDoc.exists) {
              const currentStock = invDoc.data()?.stock || 0;
              await invDoc.ref.update({
                stock: Math.max(0, currentStock - (item.quantity || 1))
              });
            }
          }
          // Mark as fulfilled if it's purely digital and we want to auto-fulfill
          await orderRef.update({ fulfillment_status: "fulfilled" });
        }
      }
    } else if (
      transactionStatus == 'cancel' ||
      transactionStatus == 'deny' ||
      transactionStatus == 'expire'
    ) {
      console.log(`Transaction ${orderId} failed or expired`);
      await orderRef.update({
        payment_status: "failed",
        midtrans_transaction_id: payload.transaction_id
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Midtrans Webhook Error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

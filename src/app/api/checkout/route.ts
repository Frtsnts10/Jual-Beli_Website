import { NextResponse } from "next/server";
// @ts-ignore
import midtransClient from "midtrans-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, customerDetails, orderId } = body;

    // Initialize Midtrans Snap API
    const snap = new midtransClient.Snap({
      isProduction: process.env.NODE_ENV === "production" && !!process.env.MIDTRANS_IS_PRODUCTION,
      serverKey: process.env.MIDTRANS_SERVER_KEY || "dummy",
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "dummy",
    });

    // Calculate gross amount
    const grossAmount = items.reduce((acc: number, item: any) => acc + (item.selling_price * item.quantity), 0);

    const parameter = {
      transaction_details: {
        order_id: orderId || `ORDER-${Date.now()}`,
        gross_amount: grossAmount,
      },
      item_details: items.map((item: any) => ({
        id: item.id,
        price: item.selling_price,
        quantity: item.quantity,
        name: item.name.substring(0, 50),
      })),
      customer_details: {
        first_name: customerDetails?.name || "Customer",
        email: customerDetails?.email || "customer@example.com",
      },
    };

    const transaction = await snap.createTransaction(parameter);
    
    return NextResponse.json({ token: transaction.token, redirect_url: transaction.redirect_url });
  } catch (error: any) {
    console.error("Midtrans Error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction", details: error.message },
      { status: 500 }
    );
  }
}

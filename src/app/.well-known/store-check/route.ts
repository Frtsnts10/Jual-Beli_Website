import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/stores";

// Identity probe used by the dashboard's custom-domain check: fetching
// https://<custom-domain>/.well-known/store-check proves DNS, TLS and routing all lead to
// this deployment, and the returned store_id proves it resolves to the right store.
// `?host=` exists for local testing, where the probe can't travel through real DNS.
export async function GET(req: NextRequest) {
  const host = (req.nextUrl.searchParams.get("host") ?? req.headers.get("host") ?? "").toLowerCase().replace(/:\d+$/, "");
  const store = host.includes(".") ? await getStore(host) : null;
  return NextResponse.json(store ? { store_id: store.id } : { store_id: null }, {
    status: store ? 200 : 404,
    headers: { "Cache-Control": "no-store" },
  });
}

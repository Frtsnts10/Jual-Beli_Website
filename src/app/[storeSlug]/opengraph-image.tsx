import { ImageResponse } from "next/og";
import { getStore } from "@/lib/stores";
import { readableOn } from "@/lib/color";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const store = await getStore((await params).storeSlug);
  const accent = store?.storefront_config.accent_color ?? "#10B981";
  const fg = readableOn(accent);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: accent, color: fg }}>
        <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1.05 }}>{store?.store_name ?? "Jual"}</div>
        <div style={{ fontSize: 36, marginTop: 24, opacity: 0.85 }}>{store?.storefront_config.tagline || "Checkout instan · Akun dikirim ke WhatsApp"}</div>
      </div>
    ),
    size
  );
}

// QRIS (EMVCo merchant-presented QR) helpers — identical copy in the storefront repo
// (src/lib/qris.ts); keep both in sync. Pure: no I/O.
//
// A seller's printed QRIS is "static": the payer types the amount. For checkout we turn it
// into a "dynamic" one with the order total filled in (tag 54) — same merchant, same
// account, the money still goes straight to the seller.

export interface Tlv {
  id: string;
  value: string;
}

export function parseTlv(payload: string): Tlv[] | null {
  const out: Tlv[] = [];
  let i = 0;
  while (i < payload.length) {
    const id = payload.slice(i, i + 2);
    const len = Number(payload.slice(i + 2, i + 4));
    if (!/^\d{2}$/.test(id) || !/^\d{2}$/.test(payload.slice(i + 2, i + 4)) || i + 4 + len > payload.length) return null;
    out.push({ id, value: payload.slice(i + 4, i + 4 + len) });
    i += 4 + len;
  }
  return out;
}

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF), as QRIS tag 63 requires; 4 upper-case hex chars. */
export function crc16(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

const tlv = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`;

export type QrisInfo = { ok: true; merchant: string; city: string; nmid: string | null } | { ok: false; error: string };

/** Checks that a decoded QR string is a valid QRIS (format, CRC, Indonesian rupiah merchant). */
export function inspectQris(raw: string): QrisInfo {
  const payload = raw.trim();
  if (!payload.startsWith("000201")) return { ok: false, error: "Ini bukan kode QRIS." };
  const tags = parseTlv(payload);
  if (!tags) return { ok: false, error: "Kode QR rusak atau tidak lengkap." };
  const crc = tags.at(-1);
  if (crc?.id !== "63" || crc16(payload.slice(0, -4)) !== crc.value.toUpperCase()) return { ok: false, error: "Checksum QRIS tidak cocok — pastikan gambar QR jelas dan utuh." };
  const get = (id: string) => tags.find((t) => t.id === id)?.value ?? "";
  const merchantInfo = tags.filter((t) => Number(t.id) >= 26 && Number(t.id) <= 51).map((t) => t.value);
  if (!merchantInfo.some((v) => /ID\.CO\.QRIS|COM\.|ID\./i.test(v))) return { ok: false, error: "Ini bukan QRIS Indonesia." };
  if (get("53") && get("53") !== "360") return { ok: false, error: "QRIS harus dalam Rupiah." };
  // NMID: sub-tag 02 of the QRIS-domestic block (tag 51), when present.
  const nmid = parseTlv(get("51"))?.find((t) => t.id === "02")?.value ?? null;
  return { ok: true, merchant: get("59"), city: get("60"), nmid };
}

/** The same QRIS with the amount fixed (dynamic, tag 01 = 12). Throws on an invalid payload. */
export function qrisWithAmount(raw: string, amount: number): string {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error("Invalid amount");
  const tags = parseTlv(raw.trim());
  if (!tags) throw new Error("Invalid QRIS");
  const keep = tags.filter((t) => !["01", "54", "55", "56", "57", "63"].includes(t.id));
  const merged = [...keep, { id: "01", value: "12" }, { id: "54", value: String(amount) }].sort((a, b) => a.id.localeCompare(b.id));
  const body = merged.map((t) => tlv(t.id, t.value)).join("") + "6304";
  return body + crc16(body);
}

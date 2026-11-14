/** Normalises 08xx / 628xx / +628xx to +628xx; returns null when it isn't an Indonesian mobile number. */
export function normalisePhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const local = digits.startsWith("62") ? digits.slice(2) : digits.startsWith("0") ? digits.slice(1) : digits;
  return /^8\d{8,12}$/.test(local) ? `+62${local}` : null;
}

import { randomInt } from "node:crypto";

// Crockford-style alphabet without look-alikes (0/O, 1/I/L) so IDs read well over WhatsApp.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function newOrderId() {
  let id = "ORD-";
  for (let i = 0; i < 8; i++) id += ALPHABET[randomInt(ALPHABET.length)];
  return id;
}

export const ORDER_ID_RE = /^ORD-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/;

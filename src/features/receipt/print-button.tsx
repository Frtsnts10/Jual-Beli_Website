"use client";

import { Printer } from "lucide-react";
import { btnPrimary } from "@/lib/ui";

/** The browser's print dialog also offers "Save as PDF". */
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={`${btnPrimary} px-5`}>
      <Printer className="size-4" /> Cetak / simpan PDF
    </button>
  );
}

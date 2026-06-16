"use server";

import { adminAuth } from "@/lib/firebase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function customerSignOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  revalidatePath("/", "layout");
  redirect("/");
}

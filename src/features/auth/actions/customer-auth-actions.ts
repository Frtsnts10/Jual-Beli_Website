"use server";

import { adminDb, adminAuth, getAuthenticatedUser } from "@/lib/firebase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function customerSignInAction(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) return { error: "Credentials required" };

    // Server-side sign in is not possible with Firebase Client SDK.
    // The client component must handle signInWithEmailAndPassword,
    // then POST the idToken to /api/auth/session.
    return { error: "Please use the client-side sign-in flow." };
  } catch (err: any) {
    if (err.message === "NEXT_REDIRECT" || err.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("Customer signin unhandled exception:", err);
    return {
      error: err.message === "fetch failed" || err.message?.includes("fetch")
        ? "Connection to database failed. Please verify your Firebase project is active and environment variables are configured correctly."
        : err.message || "An unexpected error occurred during signin."
    };
  }
}

export async function customerSignUpAction(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    if (!email || !password || !name) return { error: "All fields are mandatory" };

    // Create user via Firebase Admin
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    return {
      success: true,
      message: "Account created successfully! Please sign in with your credentials."
    };
  } catch (err: any) {
    if (err.message === "NEXT_REDIRECT" || err.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("Customer signup unhandled exception:", err);
    return { error: err.message || "An unexpected error occurred during signup." };
  }
}

export async function customerSignOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  revalidatePath("/", "layout");
  redirect("/");
}

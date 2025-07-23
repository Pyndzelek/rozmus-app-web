import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function createClient() {
  const cookieStore = await cookies();

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      "Missing Supabase URL or Anon Key. Please check your .env.local file."
    );
  }

  // Create and return the Supabase server client
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name);
          return cookie ? cookie.value : null; // Return null if cookie doesn't exist
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({
            name,
            value,
            ...options,
            httpOnly: options.httpOnly ?? true, // Default to httpOnly for security
            secure: process.env.NODE_ENV === "production", // Secure in production
            sameSite: options.sameSite ?? "lax", // Default to lax for CSRF protection
          });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({
            name,
            value: "",
            ...options,
            maxAge: 0, // Explicitly expire the cookie
          });
        },
      },
    }
  );
}

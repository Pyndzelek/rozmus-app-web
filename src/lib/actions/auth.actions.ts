"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(values: z.infer<typeof loginSchema>) {
  const supabase = await createClient();

  // Krok 1: Uwierzytelnienie - sprawdź, czy email i hasło są poprawne.
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

  if (authError) {
    // Zwróć błąd, jeśli hasło lub email są nieprawidłowe.
    return { message: "Nieprawidłowy email lub hasło." };
  }

  // Upewnij się, że mamy obiekt użytkownika po zalogowaniu.
  if (!authData.user) {
    return { message: "Wystąpił nieoczekiwany błąd podczas logowania." };
  }

  // Krok 2: Autoryzacja - sprawdź, czy zalogowany użytkownik ma uprawnienia.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("group")
    .eq("id", authData.user.id)
    .single();

  // Przypadek 1: Błąd podczas pobierania profilu
  if (profileError) {
    await supabase.auth.signOut();
    return {
      message:
        "Wystąpił błąd podczas weryfikacji Twojego profilu. Skontaktuj się z administratorem.",
    };
  }

  // Przypadek 2: Profil nie istnieje
  if (!profile) {
    await supabase.auth.signOut();
    return {
      message:
        "Twój profil nie został znaleziony w systemie. Skontaktuj się z trenerem.",
    };
  }

  // Przypadek 3: Użytkownik nie jest trenerem
  if (profile.group !== "TRAINER") {
    await supabase.auth.signOut();
    return {
      message:
        "Tylko trenerzy mają dostęp do tej aplikacji. Zaloguj się jako trener.",
    };
  }

  // Jeśli wszystko się zgadza, przekieruj do panelu.
  return redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/login");
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

// Typ dla profilu klienta, który będziemy pobierać
export type ClientProfile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "full_name" | "avatar_url"
>;

export async function getClients(): Promise<ClientProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("group", "USER")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Błąd podczas pobierania klientów:", error);
    throw new Error("Nie udało się pobrać listy podopiecznych.");
  }

  return data;
}

export async function getClientById(id: string): Promise<ClientProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Błąd podczas pobierania profilu klienta:", error);
    return null;
  }

  return data;
}

export async function getDashboardStats() {
  const supabase = await createClient();

  const { count: clientCount, error: clientError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("group", "USER");

  const { count: exerciseCount, error: exerciseError } = await supabase
    .from("exercise_definitions")
    .select("*", { count: "exact", head: true });

  if (clientError || exerciseError) {
    console.error(
      "Błąd podczas pobierania statystyk:",
      clientError || exerciseError
    );
    return { clientCount: 0, exerciseCount: 0 };
  }

  return { clientCount, exerciseCount };
}

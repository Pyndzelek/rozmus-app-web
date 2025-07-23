// exercises.actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exerciseSchema } from "../validation";

type Exercise = Database["public"]["Tables"]["exercise_definitions"]["Row"];

export async function getExerciseDefinitions(): Promise<Exercise[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercise_definitions")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Błąd podczas pobierania definicji ćwiczeń:", error);
    throw new Error("Nie udało się pobierać ćwiczeń.");
  }

  return data || [];
}

export async function createExercise(formData: z.infer<typeof exerciseSchema>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercise_definitions")
    .insert([
      {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        primary_muscles_targeted: formData.primary_muscles_targeted,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Błąd podczas tworzenia ćwiczenia:", error);
    // W przyszłości można zwrócić bardziej szczegółowy błąd
    throw new Error("Nie udało się utworzyć ćwiczenia.");
  }

  revalidatePath("/dashboard/exercises");

  return data;
}

export async function updateExercise(
  id: string,
  formData: z.infer<typeof exerciseSchema>
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercise_definitions")
    .update({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      primary_muscles_targeted: formData.primary_muscles_targeted,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Błąd podczas aktualizacji ćwiczenia:", error);
    throw new Error("Nie udało się zaktualizować ćwiczenia.");
  }

  revalidatePath("/dashboard/exercises");
  return data;
}

export async function deleteExercise(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("exercise_definitions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Błąd podczas usuwania ćwiczenia:", error);
    throw new Error("Nie udało się usunąć ćwiczenia.");
  }

  revalidatePath("/dashboard/exercises");
}

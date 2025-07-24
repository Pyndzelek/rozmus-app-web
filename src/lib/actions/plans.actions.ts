// src/lib/actions/plans.actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { Database, Tables } from "@/types/supabase";
import { revalidatePath } from "next/cache";
import z from "zod";
import { exerciseParamsSchema, workoutSchema } from "../validation";

// Definiujemy typy dla naszego zagnieżdżonego zapytania
export type WorkoutExerciseWithDefinition =
  Database["public"]["Tables"]["workout_exercises"]["Row"] & {
    exercise_definitions: Pick<
      Database["public"]["Tables"]["exercise_definitions"]["Row"],
      "name" | "category"
    > | null;
  };

export type WorkoutWithExercises =
  Database["public"]["Tables"]["workouts"]["Row"] & {
    workout_exercises: WorkoutExerciseWithDefinition[];
  };

export type WorkoutPlanWithWorkouts =
  Database["public"]["Tables"]["workout_plans"]["Row"] & {
    workouts: WorkoutWithExercises[];
  };

export async function getWorkoutPlanByClientId(
  clientId: string
): Promise<WorkoutPlanWithWorkouts | null> {
  if (!clientId || clientId === "undefined") {
    throw new Error("Nieprawidłowy identyfikator podopiecznego.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_plans")
    .select(
      `
      *,
      workouts (
        *,
        workout_exercises (
          *,
          exercise_definitions (name)
        )
      )
    `
    )
    .eq("client_id", clientId)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error(
      "Błąd Supabase podczas pobierania planu treningowego:",
      error
    );
    throw new Error(`Błąd Supabase: ${error.message || JSON.stringify(error)}`);
  }

  if (!data) {
    return null;
  }

  const sortedWorkouts = data.workouts
    ? data.workouts
        .map((workout: any) => ({
          ...workout,
          workout_exercises: workout.workout_exercises
            ? workout.workout_exercises
                .map((exercise: any) => ({
                  ...exercise,
                  name: exercise.exercise_definitions?.name || exercise.name,
                }))
                .sort(
                  (
                    a: Tables<"workout_exercises">,
                    b: Tables<"workout_exercises">
                  ) => a.order - b.order
                )
            : [],
        }))
        .sort(
          (a: Tables<"workouts">, b: Tables<"workouts">) =>
            new Date(a.created_at!).getTime() -
            new Date(b.created_at!).getTime()
        )
    : [];

  return {
    ...data,
    workouts: sortedWorkouts,
  };
}

export async function createWorkoutPlan(clientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workout_plans")
    .insert({
      client_id: clientId,
      title: "Nowy Plan Treningowy",
    })
    .select()
    .single();

  if (error) {
    console.error("Błąd podczas tworzenia planu:", error);
    throw new Error("Nie udało się utworzyć planu.");
  }

  revalidatePath(`/dashboard/clients/${clientId}`);
  return data;
}

export async function createWorkout(values: z.infer<typeof workoutSchema>) {
  if (!values.planId || !values.clientId) {
    throw new Error("Plan ID i Client ID są wymagane.");
  }
  const supabase = await createClient();

  const { data, error } = await supabase.from("workouts").insert({
    workout_plan_id: values.planId,
    name: values.name,
  });

  if (error) {
    console.error("Błąd podczas tworzenia dnia treningowego:", error);
    throw new Error("Nie udało się dodać dnia treningowego.");
  }

  revalidatePath(`/dashboard/clients/${values.clientId}`);
}

export async function addExercisesToWorkout(
  workoutId: string,
  exerciseIds: string[],
  clientId: string
) {
  const supabase = await createClient();

  const { data: definitions, error: definitionsError } = await supabase
    .from("exercise_definitions")
    .select("id, name")
    .in("id", exerciseIds);

  if (definitionsError) {
    console.error(
      "Błąd podczas pobierania definicji ćwiczeń:",
      definitionsError
    );
    throw new Error("Nie udało się pobrać danych ćwiczeń.");
  }

  const { data: lastExercise, error: orderError } = await supabase
    .from("workout_exercises")
    .select("order")
    .eq("workout_id", workoutId)
    .order("order", { ascending: false })
    .limit(1)
    .single();

  if (orderError && orderError.code !== "PGRST116") {
    console.error("Błąd podczas sprawdzania kolejności:", orderError);
    throw new Error("Nie udało się ustalić kolejności ćwiczeń.");
  }

  const lastOrder = lastExercise?.order ?? 0;

  const exercisesToAdd = definitions.map((def, index) => ({
    workout_id: workoutId,
    exercise_definition_id: def.id,
    name: def.name,
    order: lastOrder + index + 1,
  }));

  const { error } = await supabase
    .from("workout_exercises")
    .insert(exercisesToAdd);

  if (error) {
    console.error("Błąd podczas dodawania ćwiczeń:", error);
    throw new Error("Nie udało się dodać ćwiczeń.");
  }

  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function updateWorkoutExercise(
  workoutExerciseId: string,
  clientId: string,
  values: z.infer<typeof exerciseParamsSchema>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_exercises")
    .update({
      sets: values.sets,
      reps: values.reps,
      tempo: values.tempo,
      rest_period: values.rest_period,
      notes: values.notes,
    })
    .eq("id", workoutExerciseId);

  if (error) {
    console.error("Błąd podczas aktualizacji ćwiczenia:", error);
    throw new Error("Nie udało się zaktualizować ćwiczenia.");
  }

  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function deleteWorkoutExercise(
  workoutExerciseId: string,
  clientId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_exercises")
    .delete()
    .eq("id", workoutExerciseId);

  if (error) {
    console.error("Błąd podczas usuwania ćwiczenia:", error);
    throw new Error("Nie udało się usunąć ćwiczenia.");
  }

  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function updateExercisesOrder(
  items: { id: string; order: number }[],
  clientId: string
) {
  const supabase = await createClient();

  let caseStatement = '"order" = CASE id ';
  items.forEach((item) => {
    caseStatement += `WHEN '${item.id}' THEN ${item.order} `;
  });
  caseStatement += "END";

  const idsToUpdate = items.map((item) => `'${item.id}'`).join(", ");

  const query = `
    UPDATE public.workout_exercises
    SET ${caseStatement}
    WHERE id IN (${idsToUpdate})
  `;

  const { error } = await (supabase as any).rpc("execute_sql", { sql: query });

  if (error) {
    console.error("Błąd podczas aktualizacji kolejności (raw SQL):", error);
    throw new Error("Nie udało się zaktualizować kolejności.");
  }

  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function deleteWorkout(workoutId: string, clientId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", workoutId);

  if (error) {
    console.error("Błąd podczas usuwania dnia treningowego:", error);
    throw new Error("Nie udało się usunąć dnia treningowego.");
  }

  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function updateWorkout(
  workoutId: string,
  name: string,
  clientId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workouts")
    .update({ name })
    .eq("id", workoutId);

  if (error) {
    console.error("Błąd podczas aktualizacji dnia treningowego:", error);
    throw new Error("Nie udało się zaktualizować dnia treningowego.");
  }

  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function deleteWorkoutPlan(planId: string, clientId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_plans")
    .delete()
    .eq("id", planId);
  if (error) {
    console.error("Błąd podczas usuwania planu:", error);
    throw new Error("Nie udało się usunąć planu.");
  }
  revalidatePath(`/dashboard/clients/${clientId}`);
}

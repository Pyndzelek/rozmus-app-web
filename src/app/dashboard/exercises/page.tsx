import { getExerciseDefinitions } from "@/lib/actions/exercises.actions";
import { ExerciseDataTable } from "@/components/features/exercises/exercise-data-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biblioteka ćwiczeń",
};

export default async function ExercisesPage() {
  const exercises = await getExerciseDefinitions();

  return (
    <div className="container mx-auto py-10">
      <ExerciseDataTable data={exercises} />
    </div>
  );
}

// src/app/dashboard/exercises/page.tsx
import { getExerciseDefinitions } from "@/lib/actions/exercises.actions";
import { ExerciseDataTable } from "@/components/features/exercises/exercise-data-table";

export default async function ExercisesPage() {
  const exercises = await getExerciseDefinitions();

  return (
    <div className="container mx-auto py-10">
      <ExerciseDataTable data={exercises} />
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

// Importy akcji i typów
import {
  WorkoutPlanWithWorkouts,
  WorkoutWithExercises,
  createWorkoutPlan,
  createWorkout,
  addExercisesToWorkout,
} from "@/lib/actions/plans.actions";

import { workoutSchema } from "@/lib/validation";

// Importy komponentów UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { ExercisePickerModal } from "./exercise-picker-modal";
import { WorkoutExerciseItem } from "./workout-exercise-planner";

interface WorkoutPlanEditorProps {
  plan: WorkoutPlanWithWorkouts | null;
  clientId: string;
}

export function WorkoutPlanEditor({ plan, clientId }: WorkoutPlanEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedWorkout, setSelectedWorkout] =
    useState<WorkoutWithExercises | null>(null);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const form = useForm<z.infer<typeof workoutSchema>>({
    resolver: zodResolver(workoutSchema),
    defaultValues: { name: "", planId: plan?.id, clientId: clientId },
  });

  useEffect(() => {
    // Ten efekt uruchomi się za każdym razem, gdy prop `plan` się zmieni.
    if (selectedWorkout && plan) {
      // Znajdź zaktualizowaną wersję wybranego dnia w nowym planie.
      const updatedWorkout = plan.workouts.find(
        (w) => w.id === selectedWorkout.id
      );
      // Zaktualizuj stan, aby odświeżyć UI.
      if (updatedWorkout) {
        setSelectedWorkout(updatedWorkout);
      }
    }
  }, [plan, selectedWorkout?.id]); // Zależności hooka

  const handleCreatePlan = () => {
    startTransition(async () => {
      try {
        await createWorkoutPlan(clientId);
        toast.success("Plan został utworzony!");
      } catch (error) {
        toast.error("Wystąpił błąd podczas tworzenia planu.");
      }
    });
  };

  const onWorkoutSubmit = (values: z.infer<typeof workoutSchema>) => {
    startTransition(async () => {
      try {
        await createWorkout(values);
        toast.success("Nowy dzień treningowy został dodany.");
        form.reset();
        setIsAddingWorkout(false);
      } catch (error) {
        toast.error("Nie udało się dodać dnia treningowego.");
      }
    });
  };

  const handleAddExercises = (exerciseIds: string[]) => {
    if (!selectedWorkout) return;

    startTransition(async () => {
      try {
        await addExercisesToWorkout(selectedWorkout.id, exerciseIds, clientId);
        toast.success("Ćwiczenia zostały dodane do planu.");
        setIsPickerOpen(false);
      } catch (error) {
        toast.error("Wystąpił błąd podczas dodawania ćwiczeń.");
      }
    });
  };

  if (!plan) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <h3 className="text-xl font-semibold">Brak planu treningowego</h3>
        <p className="text-gray-500 mt-2 mb-4">
          Ten podopieczny nie ma jeszcze przypisanego planu.
        </p>
        <Button onClick={handleCreatePlan} disabled={isPending}>
          {isPending ? "Tworzenie..." : "+ Stwórz nowy plan"}
        </Button>
      </div>
    );
  }
  const existingExerciseIds =
    selectedWorkout?.workout_exercises.map((we) => we.exercise_definition_id) ??
    [];

  return (
    <>
      <ExercisePickerModal
        isOpen={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onAddExercises={handleAddExercises}
        existingExerciseIds={existingExerciseIds}
        isPending={isPending}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Kolumna Lewa: Dni Treningowe */}
        <div className="md:col-span-1">
          <h3 className="text-lg font-semibold mb-4">
            Dni Treningowe ({plan.workouts.length})
          </h3>
          <div className="space-y-3">
            {plan.workouts.map((workout) => (
              <Card
                key={workout.id}
                onClick={() => setSelectedWorkout(workout)}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedWorkout?.id === workout.id
                    ? "border-primary shadow-md"
                    : "hover:border-gray-400 dark:hover:border-gray-600"
                )}
              >
                <CardContent className="p-3">
                  <p className="font-medium">{workout.name}</p>
                </CardContent>
              </Card>
            ))}

            {/* Formularz dodawania nowego dnia */}
            {isAddingWorkout ? (
              <Card className="p-3">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onWorkoutSubmit)}
                    className="flex items-center gap-2"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Nazwa dnia, np. Trening A"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="sm" disabled={isPending}>
                      {isPending ? "..." : "Dodaj"}
                    </Button>
                  </form>
                </Form>
              </Card>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsAddingWorkout(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Dodaj dzień treningowy
              </Button>
            )}
          </div>
        </div>

        {/* Kolumna Prawa: Szczegóły wybranego dnia */}
        <div className="md:col-span-2">
          {selectedWorkout ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Ćwiczenia dla: {selectedWorkout.name}</span>
                  <Button size="sm" onClick={() => setIsPickerOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Dodaj ćwiczenie
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedWorkout.workout_exercises.length > 0 ? (
                  <div className="space-y-4">
                    {" "}
                    {/* Zmienione na `space-y-4` dla lepszego odstępu */}
                    {selectedWorkout.workout_exercises
                      .sort((a, b) => a.order - b.order) // Sortujemy wg kolejności
                      .map((exercise) => (
                        <WorkoutExerciseItem
                          key={exercise.id}
                          exercise={exercise}
                          clientId={clientId}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-gray-500">
                      Kliknij "Dodaj ćwiczenie", aby rozpocząć.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full text-center p-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-gray-500">
                Wybierz dzień z listy po lewej, aby zobaczyć lub edytować jego
                zawartość.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

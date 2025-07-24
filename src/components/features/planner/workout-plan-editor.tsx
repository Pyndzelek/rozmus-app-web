"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

// Importy akcji i typów
import {
  WorkoutPlanWithWorkouts,
  WorkoutWithExercises,
  createWorkoutPlan,
  createWorkout,
  addExercisesToWorkout,
  updateExercisesOrder,
  deleteWorkout,
  updateWorkout,
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
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExercisePickerModal } from "./exercise-picker-modal";
import { WorkoutExerciseItem } from "./workout-exercise-item";

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
  const [workoutToDelete, setWorkoutToDelete] =
    useState<WorkoutWithExercises | null>(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof workoutSchema>>({
    resolver: zodResolver(workoutSchema),
    defaultValues: { name: "", planId: plan?.id, clientId: clientId },
  });

  useEffect(() => {
    if (selectedWorkout && plan) {
      const updatedWorkout = plan.workouts.find(
        (w) => w.id === selectedWorkout.id
      );
      if (updatedWorkout) {
        const sortedExercises = [...updatedWorkout.workout_exercises].sort(
          (a, b) => a.order - b.order
        );
        setSelectedWorkout({
          ...updatedWorkout,
          workout_exercises: sortedExercises,
        });
      }
    }
  }, [plan, selectedWorkout?.id]);

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

  const handleWorkoutNameUpdate = (workoutId: string, newName: string) => {
    if (!newName.trim()) return;
    startTransition(() => {
      updateWorkout(workoutId, newName, clientId)
        .then(() => toast.success("Nazwa dnia została zaktualizowana."))
        .catch(() => toast.error("Błąd podczas aktualizacji nazwy."))
        .finally(() => setEditingWorkoutId(null));
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

  const handleDeleteWorkout = () => {
    if (!workoutToDelete) return;
    startTransition(async () => {
      try {
        await deleteWorkout(workoutToDelete.id, clientId);
        toast.success(`Dzień "${workoutToDelete.name}" został usunięty.`);
        if (selectedWorkout?.id === workoutToDelete.id) {
          setSelectedWorkout(null);
        }
        setWorkoutToDelete(null);
      } catch (error) {
        toast.error("Nie udało się usunąć dnia treningowego.");
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const exercises = selectedWorkout?.workout_exercises ?? [];
      const oldIndex = exercises.findIndex((e) => e.id === active.id);
      const newIndex = exercises.findIndex((e) => e.id === over.id);
      const reorderedExercises = arrayMove(exercises, oldIndex, newIndex);

      if (selectedWorkout) {
        setSelectedWorkout({
          ...selectedWorkout,
          workout_exercises: reorderedExercises,
        });
      }
      const itemsToUpdate = reorderedExercises.map((item, index) => ({
        id: item.id,
        order: index + 1,
      }));
      startTransition(() => {
        updateExercisesOrder(itemsToUpdate, clientId).catch(() => {
          toast.error("Nie udało się zaktualizować kolejności.");
          if (selectedWorkout) {
            setSelectedWorkout({
              ...selectedWorkout,
              workout_exercises: exercises,
            });
          }
        });
      });
    }
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

      <AlertDialog
        open={!!workoutToDelete}
        onOpenChange={(isOpen) => !isOpen && setWorkoutToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
            <AlertDialogDescription>
              Dzień treningowy <strong>{workoutToDelete?.name}</strong> oraz
              wszystkie jego ćwiczenia zostaną trwale usunięte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkout}
              disabled={isPending}
            >
              {isPending ? "Usuwanie..." : "Usuń"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h3 className="text-lg font-semibold mb-4">
            Dni Treningowe ({plan.workouts.length})
          </h3>
          <div className="space-y-3">
            {plan.workouts.map((workout) => (
              <Card
                key={workout.id}
                className={cn(
                  "transition-all",
                  selectedWorkout?.id === workout.id
                    ? "border-primary shadow-md"
                    : "hover:border-gray-400 dark:hover:border-gray-600"
                )}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedWorkout(workout)}
                  >
                    {editingWorkoutId === workout.id ? (
                      <Input
                        defaultValue={workout.name}
                        autoFocus
                        onBlur={(e) =>
                          handleWorkoutNameUpdate(workout.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleWorkoutNameUpdate(
                              workout.id,
                              e.currentTarget.value
                            );
                          if (e.key === "Escape") setEditingWorkoutId(null);
                        }}
                      />
                    ) : (
                      <p className="font-medium">{workout.name}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditingWorkoutId(workout.id)}
                  >
                    <Pencil className="h-4 w-4 text-gray-500 hover:text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWorkoutToDelete(workout);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                  </Button>
                </CardContent>
              </Card>
            ))}
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
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedWorkout.workout_exercises.map((e) => e.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {selectedWorkout.workout_exercises.map((exercise) => (
                          <WorkoutExerciseItem
                            key={exercise.id}
                            exercise={exercise}
                            clientId={clientId}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
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

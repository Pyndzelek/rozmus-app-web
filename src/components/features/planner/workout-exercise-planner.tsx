"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { WorkoutExerciseWithDefinition } from "@/lib/actions/plans.actions";
import { exerciseParamsSchema } from "@/lib/validation";
import { updateWorkoutExercise } from "@/lib/actions/plans.actions";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { deleteWorkoutExercise } from "@/lib/actions/plans.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface WorkoutExerciseItemProps {
  exercise: WorkoutExerciseWithDefinition;
  clientId: string;
}

export function WorkoutExerciseItem({
  exercise,
  clientId,
}: WorkoutExerciseItemProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof exerciseParamsSchema>>({
    resolver: zodResolver(exerciseParamsSchema),
    defaultValues: {
      sets: exercise.sets ?? "",
      reps: exercise.reps ?? "",
      tempo: exercise.tempo ?? "",
      rest_period: exercise.rest_period ?? "",
    },
  });

  const handleBlur = (
    fieldName: keyof z.infer<typeof exerciseParamsSchema>
  ) => {
    const value = form.getValues(fieldName);
    if (value === (exercise[fieldName] ?? "")) return;

    startTransition(() => {
      updateWorkoutExercise(exercise.id, clientId, { [fieldName]: value })
        .then(() => toast.success(`Zaktualizowano pole: ${fieldName}`))
        .catch(() => toast.error("Błąd aktualizacji"));
    });
  };

  const handleDelete = () => {
    startTransition(() => {
      deleteWorkoutExercise(exercise.id, clientId)
        .then(() => toast.success("Ćwiczenie zostało usunięte."))
        .catch(() => toast.error("Błąd podczas usuwania."));
    });
  };

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <p className="font-semibold">
            {exercise.exercise_definitions?.name ?? "Błąd nazwy"}
          </p>

          {/* Przycisk usuwania z dialogiem potwierdzającym */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Czy jesteś pewien?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tej akcji nie można cofnąć. Ćwiczenie zostanie trwale usunięte
                  z tego dnia treningowego.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                  {isPending ? "Usuwanie..." : "Usuń"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <Form {...form}>
          <form className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FormField
              control={form.control}
              name="sets"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Serie"
                      {...field}
                      onBlur={() => handleBlur("sets")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reps"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Powt."
                      {...field}
                      onBlur={() => handleBlur("reps")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tempo"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Tempo"
                      {...field}
                      onBlur={() => handleBlur("tempo")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rest_period"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Przerwa"
                      {...field}
                      onBlur={() => handleBlur("rest_period")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

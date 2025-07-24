"use client";

import { useEffect, useState } from "react";
import { getExerciseDefinitions } from "@/lib/actions/exercises.actions";
import { Database } from "@/types/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Mały komponent do wyświetlania wskaźnika ładowania
const LoadingSpinner = () => (
  <div className="flex h-72 w-full items-center justify-center">
    <svg
      className="h-8 w-8 animate-spin text-primary"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
);

type ExerciseDefinition =
  Database["public"]["Tables"]["exercise_definitions"]["Row"];

interface ExercisePickerModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddExercises: (exerciseIds: string[]) => void;
  isPending: boolean;
  existingExerciseIds: string[];
}

export function ExercisePickerModal({
  isOpen,
  onOpenChange,
  onAddExercises,
  isPending,
  existingExerciseIds,
}: ExercisePickerModalProps) {
  const [allExercises, setAllExercises] = useState<ExerciseDefinition[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getExerciseDefinitions()
        .then(setAllExercises)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  const handleSelect = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const filteredExercises = allExercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Wybierz ćwiczenia z biblioteki</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Filtruj ćwiczenia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="my-2"
        />
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <ScrollArea className="h-72">
            <div className="space-y-2 pr-4">
              {filteredExercises.map((exercise) => {
                const isAlreadyAdded = existingExerciseIds.includes(
                  exercise.id
                );
                return (
                  <div
                    key={exercise.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent"
                  >
                    <Checkbox
                      id={exercise.id}
                      checked={
                        selectedExercises.includes(exercise.id) ||
                        isAlreadyAdded
                      }
                      onCheckedChange={() =>
                        !isAlreadyAdded && handleSelect(exercise.id)
                      }
                      disabled={isAlreadyAdded}
                    />
                    <label
                      htmlFor={exercise.id}
                      className={cn(
                        "text-sm font-medium leading-none flex-1",
                        isAlreadyAdded
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      )}
                    >
                      {exercise.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
        <DialogFooter>
          <Button
            onClick={() => {
              onAddExercises(selectedExercises);
              setSelectedExercises([]);
            }}
            disabled={isPending || selectedExercises.length === 0}
          >
            {isPending ? "Dodawanie..." : `Dodaj (${selectedExercises.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// src/app/dashboard/clients/[clientId]/_components/exercise-picker-modal.tsx
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

  useEffect(() => {
    // Pobierz listę ćwiczeń po pierwszym otwarciu modala
    if (isOpen) {
      getExerciseDefinitions().then(setAllExercises);
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
        <ScrollArea className="h-72">
          <div className="space-y-2 pr-4">
            {filteredExercises.map((exercise) => {
              const isAlreadyAdded = existingExerciseIds.includes(exercise.id);
              return (
                <div
                  key={exercise.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent"
                >
                  <Checkbox
                    id={exercise.id}
                    checked={
                      selectedExercises.includes(exercise.id) || isAlreadyAdded
                    }
                    onCheckedChange={() =>
                      !isAlreadyAdded && handleSelect(exercise.id)
                    }
                    disabled={isAlreadyAdded}
                  />
                  <label
                    htmlFor={exercise.id}
                    className={cn(
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
        <DialogFooter>
          <Button
            onClick={() => {
              onAddExercises(selectedExercises);
              setSelectedExercises([]); // Resetuj po dodaniu
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

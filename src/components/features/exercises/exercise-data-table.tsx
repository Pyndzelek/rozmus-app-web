"use client";

import { useState, useTransition } from "react";
import { Database } from "@/types/supabase";
import { toast } from "sonner";
import { z } from "zod";
import { createExercise } from "@/lib/actions/exercises.actions";
import { exerciseSchema } from "@/lib/validation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { ExerciseForm } from "./exercise-form";

type Exercise = Database["public"]["Tables"]["exercise_definitions"]["Row"];

interface ExerciseDataTableProps {
  data: Exercise[];
}

export function ExerciseDataTable({ data }: ExerciseDataTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: z.infer<typeof exerciseSchema>) => {
    startTransition(async () => {
      try {
        await createExercise(values);
        toast.success("Sukces!", {
          description: "Nowe ćwiczenie zostało dodane.",
        });
        setIsModalOpen(false); // Zamknij modal po sukcesie
      } catch (error) {
        toast.error("Błąd!", { description: "Nie udało się dodać ćwiczenia." });
      }
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Biblioteka Ćwiczeń</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          + Dodaj Nowe Ćwiczenie
        </Button>
      </div>

      {/* Okno dialogowe z formularzem */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Dodaj nowe ćwiczenie</DialogTitle>
            <DialogDescription>
              Wypełnij poniższe pola, aby dodać nowe ćwiczenie do swojej
              biblioteki.
            </DialogDescription>
          </DialogHeader>
          <ExerciseForm onSubmit={onSubmit} isPending={isPending} />
        </DialogContent>
      </Dialog>

      {/* Istniejąca tabela */}
      <div className="rounded-md border">
        <Table>
          {/* ...reszta kodu tabeli bez zmian... */}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Nazwa ćwiczenia</TableHead>
              <TableHead>Kategoria</TableHead>
              <TableHead>Główne mięśnie</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((exercise) => (
              <TableRow key={exercise.id}>
                <TableCell className="font-medium">{exercise.name}</TableCell>
                <TableCell>
                  {exercise.category && (
                    <Badge variant="outline">{exercise.category}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {exercise.primary_muscles_targeted?.map((muscle) => (
                      <Badge key={muscle} variant="secondary">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

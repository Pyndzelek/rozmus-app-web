"use client";

import { useState, useTransition } from "react";
import { Database } from "@/types/supabase";
import { toast } from "sonner";
import { z } from "zod";
import {
  createExercise,
  deleteExercise,
  updateExercise,
} from "@/lib/actions/exercises.actions";
import { MoreHorizontal, Trash2, Pencil } from "lucide-react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExerciseForm } from "./exercise-form";

type Exercise = Database["public"]["Tables"]["exercise_definitions"]["Row"];

interface ExerciseDataTableProps {
  data: Exercise[];
}

export function ExerciseDataTable({ data }: ExerciseDataTableProps) {
  const [isPending, startTransition] = useTransition();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Stany dla edycji
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  // Stany dla usuwania
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(
    null
  );

  // Handler do otwierania modala edycji
  const handleEditClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsEditModalOpen(true);
  };

  // Handler do otwierania alertu usuwania
  const handleDeleteClick = (exercise: Exercise) => {
    setExerciseToDelete(exercise);
    setIsDeleteAlertOpen(true);
  };

  // Handler do wysyłania formularza (obsługuje teraz tworzenie i edycję)
  const onSubmit = (values: z.infer<typeof exerciseSchema>) => {
    startTransition(async () => {
      try {
        if (selectedExercise) {
          // Tryb edycji
          await updateExercise(selectedExercise.id, values);
          toast.success("Sukces!", {
            description: "Ćwiczenie zostało zaktualizowane.",
          });
          setIsEditModalOpen(false);
          setSelectedExercise(null);
        } else {
          // Tryb tworzenia
          await createExercise(values);
          toast.success("Sukces!", {
            description: "Nowe ćwiczenie zostało dodane.",
          });
          setIsCreateModalOpen(false);
        }
      } catch (error) {
        toast.error("Błąd!", { description: "Wystąpił nieoczekiwany błąd." });
      }
    });
  };

  // Handler do potwierdzenia usunięcia
  const onConfirmDelete = () => {
    if (!exerciseToDelete) return;

    startTransition(async () => {
      try {
        await deleteExercise(exerciseToDelete.id);
        toast.success("Sukces!", {
          description: `Ćwiczenie "${exerciseToDelete.name}" zostało usunięte.`,
        });
        setIsDeleteAlertOpen(false);
        setExerciseToDelete(null);
      } catch (error) {
        toast.error("Błąd!", {
          description: "Nie udało się usunąć ćwiczenia.",
        });
      }
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Biblioteka Ćwiczeń</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          + Dodaj Nowe Ćwiczenie
        </Button>
      </div>

      {/* Dialog do TWORZENIA ćwiczeń */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj nowe ćwiczenie</DialogTitle>
          </DialogHeader>
          <ExerciseForm onSubmit={onSubmit} isPending={isPending} />
        </DialogContent>
      </Dialog>

      {/* Dialog do EDYCJI ćwiczeń */}
      <Dialog
        open={isEditModalOpen}
        onOpenChange={(isOpen) => {
          setIsEditModalOpen(isOpen);
          if (!isOpen) setSelectedExercise(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj ćwiczenie</DialogTitle>
          </DialogHeader>
          <ExerciseForm
            onSubmit={onSubmit}
            isPending={isPending}
            initialData={selectedExercise}
          />
        </DialogContent>
      </Dialog>

      {/* Alert do POTWIERDZENIA USUNIĘCIA */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej akcji nie można cofnąć. Ćwiczenie{" "}
              <strong>{exerciseToDelete?.name}</strong> zostanie trwale
              usunięte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDelete} disabled={isPending}>
              {isPending ? "Usuwanie..." : "Usuń"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tabela */}
      <div className="rounded-md border bg-white dark:bg-gray-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa</TableHead>
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
                    {exercise.primary_muscles_targeted?.map((m) => (
                      <Badge key={m} variant="secondary">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Akcje</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleEditClick(exercise)}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edytuj
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(exercise)}
                        className="text-red-500"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Usuń
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

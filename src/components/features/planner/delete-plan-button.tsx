"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteWorkoutPlan } from "@/lib/actions/plans.actions";
import { Button } from "@/components/ui/button";
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
import { Trash2 } from "lucide-react";

interface DeletePlanButtonProps {
  planId: string;
  clientId: string;
}

export function DeletePlanButton({ planId, clientId }: DeletePlanButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteWorkoutPlan(planId, clientId);
        toast.success("Plan treningowy został usunięty.");
      } catch (error) {
        toast.error("Nie udało się usunąć planu.");
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Usuń Plan
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Czy na pewno chcesz usunąć ten plan?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tej akcji nie można cofnąć. Cały plan treningowy, wraz ze wszystkimi
            dniami i ćwiczeniami, zostanie trwale usunięty.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending ? "Usuwanie..." : "Tak, usuń plan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

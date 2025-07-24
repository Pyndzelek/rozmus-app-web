import { getWorkoutPlanByClientId } from "@/lib/actions/plans.actions";
import { getClientById } from "@/lib/actions/clients.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ClientPlanPageProps {
  params: { clientId: string };
}

export default async function ClientPlanPage({ params }: ClientPlanPageProps) {
  try {
    if (!params.clientId || params.clientId === "undefined") {
      throw new Error("Nieprawidłowy identyfikator podopiecznego w URL.");
    }

    const [client, plan] = await Promise.all([
      getClientById(params.clientId),
      getWorkoutPlanByClientId(params.clientId),
    ]);

    // Sortowanie treningów według created_at (rosnąco)
    const sortedWorkouts = plan?.workouts
      ? [...plan.workouts].sort(
          (a, b) =>
            new Date(a.created_at!).getTime() -
            new Date(b.created_at!).getTime()
        )
      : [];

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Plan Treningowy dla{" "}
            <span className="font-bold">
              {client ? `${client.full_name}` : "podopiecznego"}
            </span>
          </h1>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót do Panelu głównego
            </Link>
          </Button>
        </div>

        {plan ? (
          <Card>
            <CardHeader>
              <CardTitle>{plan.title}</CardTitle>
              {plan.general_plan_notes && (
                <p className="text-sm text-muted-foreground">
                  {plan.general_plan_notes}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {sortedWorkouts.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {sortedWorkouts.map((workout, index) => (
                    <AccordionItem key={workout.id} value={workout.id}>
                      <AccordionTrigger className="text-lg font-semibold">
                        {workout.name}
                      </AccordionTrigger>
                      <AccordionContent>
                        {workout.workout_exercises.length > 0 ? (
                          <ul className="space-y-4">
                            {[...workout.workout_exercises]
                              .sort((a, b) => a.order - b.order)
                              .map((exercise, exIndex) => (
                                <li
                                  key={exercise.id}
                                  className="flex flex-col space-y-1 border-b pb-2 last:border-b-0"
                                >
                                  <span className="font-medium text-base">
                                    {exIndex + 1}. {exercise.name}
                                  </span>
                                  <div className="text-sm text-muted-foreground">
                                    <span>
                                      Serie: {exercise.sets || "Brak"} |{" "}
                                    </span>
                                    <span>
                                      Powtórzenia: {exercise.reps || "Brak"} |{" "}
                                    </span>
                                    <span>
                                      Tempo: {exercise.tempo || "Brak"} |{" "}
                                    </span>
                                    <span>
                                      Odpoczynek:{" "}
                                      {exercise.rest_period || "Brak"}
                                    </span>
                                  </div>
                                  {exercise.notes && (
                                    <p className="text-sm text-muted-foreground italic">
                                      Notatki: {exercise.notes}
                                    </p>
                                  )}
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Brak ćwiczeń w tym dniu treningowym.
                          </p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Brak dni treningowych w tym planie.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                Ten podopieczny nie ma aktywnego planu treningowego.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/dashboard">Powrót do Panelu głównego</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-sm text-red-500">
            Błąd podczas ładowania planu treningowego:{" "}
            {(error as Error).message}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard">Powrót do Panelu głównego</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
}

// src/app/dashboard/clients/[clientId]/page.tsx
import { getClientById } from "@/lib/actions/clients.actions";
import { getWorkoutPlanByClientId } from "@/lib/actions/plans.actions";
import { notFound } from "next/navigation";
import { WorkoutPlanEditor } from "@/components/features/planner/workout-plan-editor";

interface ClientPageProps {
  params: {
    clientId: string;
  };
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { clientId } = params;

  const [client, plan] = await Promise.all([
    getClientById(clientId),
    getWorkoutPlanByClientId(clientId),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <div>
      {/* ...nagłówek z danymi klienta bez zmian... */}
      <div className="flex items-center gap-4 mb-8">{/* ... */}</div>

      {/* Zastępujemy stary placeholder naszym nowym edytorem */}
      <div className="p-8 bg-white dark:bg-gray-900 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-6 border-b pb-4">
          {client.full_name} - Plan treningowy
        </h2>
        <WorkoutPlanEditor plan={plan} clientId={client.id} />
      </div>
    </div>
  );
}

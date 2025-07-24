import { getClientById } from "@/lib/actions/clients.actions";
import { getWorkoutPlanByClientId } from "@/lib/actions/plans.actions";
import { notFound } from "next/navigation";
import { WorkoutPlanEditor } from "@/components/features/planner/workout-plan-editor";
import { DeletePlanButton } from "@/components/features/planner/delete-plan-button";

interface ClientPageProps {
  params: {
    clientId: string;
  };
}

export default async function ClientPage(props: ClientPageProps) {
  const params = await props.params;
  const clientId = params.clientId;

  const [client, plan] = await Promise.all([
    getClientById(clientId),
    getWorkoutPlanByClientId(clientId),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <div>
      <div className="p-8 bg-white dark:bg-gray-900 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold">
            {client.full_name} - Plan treningowy
          </h2>
          {/* Przycisk usuwania pojawi się tylko, gdy plan istnieje */}
          {plan && <DeletePlanButton planId={plan.id} clientId={client.id} />}
        </div>
        <WorkoutPlanEditor plan={plan} clientId={client.id} />
      </div>
    </div>
  );
}

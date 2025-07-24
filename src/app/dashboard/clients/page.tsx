// src/app/dashboard/clients/page.tsx
import { getClients } from "@/lib/actions/clients.actions";
import { ClientList } from "@/components/features/clients/client-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moi Podopieczni",
};
export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Moi Podopieczni</h1>
      </div>

      <ClientList clients={clients} />
    </div>
  );
}

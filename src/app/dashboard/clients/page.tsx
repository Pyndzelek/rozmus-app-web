// src/app/dashboard/clients/page.tsx
import { getClients } from "@/lib/actions/clients.actions";
import { ClientList } from "@/components/features/clients/client-list";

export default async function ClientsPage() {
  // Ta strona powinna wywoływać TYLKO funkcję pobierającą listę wszystkich klientów.
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

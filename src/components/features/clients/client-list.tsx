"use client";

import { ClientProfile } from "@/lib/actions/clients.actions";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { User } from "lucide-react";

interface ClientListProps {
  clients: ClientProfile[];
}

export function ClientList({ clients }: ClientListProps) {
  // Cała logika 'useState', 'useTransition' i 'onInviteSubmit' została usunięta.

  return (
    <>
      {clients.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {clients.map((client) => (
            <Link href={`/dashboard/clients/${client.id}`} key={client.id}>
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={client.avatar_url ?? undefined}
                      alt={client.full_name ?? "Avatar"}
                    />
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base font-medium">
                      {client.full_name ?? "Brak nazwy"}
                    </CardTitle>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Brak podopiecznych
          </h3>
          <p className="text-gray-500 mt-2">
            Gdy Twoi podopieczni zarejestrują się przez aplikację mobilną,
            pojawią się tutaj.
          </p>
        </div>
      )}
    </>
  );
}

import { getClients, getDashboardStats } from "@/lib/actions/clients.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Dumbbell, User } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [stats, recentClients] = await Promise.all([
    getDashboardStats(),
    getClients(),
  ]);

  const clientsToShow = recentClients.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Sekcja statystyk */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Liczba Podopiecznych
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientCount}</div>
            <p className="text-xs text-muted-foreground">
              Aktywni podopieczni w systemie
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ćwiczenia w Bazie
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.exerciseCount}</div>
            <p className="text-xs text-muted-foreground">
              Gotowe do użycia w planach
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sekcja ostatnich podopiecznych i szybkich akcji */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ostatnio Dodani Podopieczni</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clientsToShow.length > 0 ? (
              clientsToShow.map((client) => (
                <div key={client.id} className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={client.avatar_url ?? undefined} />
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">
                      {client.full_name}
                    </p>
                  </div>
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/dashboard/clients/${client.id}`}>
                      Zobacz Plan
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Brak podopiecznych.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

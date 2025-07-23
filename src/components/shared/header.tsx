import { Menu } from "lucide-react";
import { Button } from "../ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 dark:bg-gray-900 dark:border-gray-800 sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {/* Przycisk do otwierania menu na mobile (w przyszłości) */}
      <Button variant="outline" size="icon" className="lg:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Otwórz menu</span>
      </Button>
      <div className="flex-1" />{" "}
      {/* Pusty div do wypchnięcia elementów na prawo */}
      {/* Tutaj w przyszłości menu użytkownika */}
    </header>
  );
}

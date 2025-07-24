// src/components/shared/sidebar.tsx
import Link from "next/link";
import { LayoutDashboard, Users, Dumbbell, LogOut } from "lucide-react";
import { NavLink } from "@/components/shared/nav-link";
import { signOut } from "@/lib/actions/auth.actions";

const navItems = [
  {
    href: "/dashboard",
    label: "Panel Główny",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/clients",
    label: "Kreator Planów",
    icon: Users,
  },
  {
    href: "/dashboard/exercises",
    label: "Biblioteka Ćwiczeń",
    icon: Dumbbell,
  },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-white p-6 dark:bg-gray-900 dark:border-gray-800 lg:flex">
      <div className="flex items-center gap-2 mb-10">
        <Dumbbell className="h-8 w-8 text-green-600" />
        <h1 className="text-2xl font-bold">Panel Trenera</h1>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <form action={signOut}>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50">
            <LogOut className="h-4 w-4" />
            Wyloguj
          </button>
        </form>
      </div>
    </aside>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { exerciseSchema } from "@/lib/validation";
import { useEffect } from "react";
import { Database } from "@/types/supabase";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Predefiniowana lista partii mięśniowych
const MUSCLE_GROUPS = [
  "Klatka piersiowa",
  "Plecy",
  "Nogi",
  "Barki",
  "Biceps",
  "Triceps",
  "Brzuch",
  "Przedramiona",
  "Pośladki",
  "Łydki",
];

type Exercise = Database["public"]["Tables"]["exercise_definitions"]["Row"];

interface ExerciseFormProps {
  onSubmit: (values: z.infer<typeof exerciseSchema>) => void;
  isPending: boolean;
  initialData?: Exercise | null;
}

export function ExerciseForm({
  onSubmit,
  isPending,
  initialData,
}: ExerciseFormProps) {
  const form = useForm<z.infer<typeof exerciseSchema>>({
    resolver: zodResolver(exerciseSchema),
    // Ustawiamy wartości domyślne na podstawie `initialData` lub puste
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      category:
        initialData?.category === "Siła" ||
        initialData?.category === "Kardio" ||
        initialData?.category === "Mobilność" ||
        initialData?.category === "Inna"
          ? initialData.category
          : "Siła",
      primary_muscles_targeted: initialData?.primary_muscles_targeted ?? [],
    },
  });

  // Efekt do resetowania formularza, gdy `initialData` się zmieni
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description ?? "",
        category:
          initialData.category === "Siła" ||
          initialData.category === "Kardio" ||
          initialData.category === "Mobilność" ||
          initialData.category === "Inna"
            ? initialData.category
            : "Siła",
        primary_muscles_targeted: initialData.primary_muscles_targeted ?? [],
      });
    }
  }, [initialData, form.reset]);

  const buttonText = initialData ? "Zapisz zmiany" : "Zapisz ćwiczenie";
  const pendingButtonText = initialData ? "Zapisywanie..." : "Dodawanie...";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* ...reszta pól formularza bez zmian... */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa ćwiczenia</FormLabel>
              <FormControl>
                <Input placeholder="np. Wyciskanie sztangi..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Siła">Siła</SelectItem>
                  <SelectItem value="Kardio">Kardio</SelectItem>
                  <SelectItem value="Mobilność">Mobilność</SelectItem>
                  <SelectItem value="Inna">Inna</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="primary_muscles_targeted"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Główne partie mięśniowe</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between h-auto",
                        !field.value?.length && "text-muted-foreground"
                      )}
                    >
                      <div className="flex flex-wrap gap-1">
                        {(field.value ?? []).length > 0
                          ? (field.value ?? []).map((muscle) => (
                              <Badge variant="secondary" key={muscle}>
                                {muscle}
                              </Badge>
                            ))
                          : "Wybierz mięśnie..."}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Szukaj partii..." />
                    <CommandEmpty>Nie znaleziono.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {MUSCLE_GROUPS.map((muscle) => (
                          <CommandItem
                            value={muscle}
                            key={muscle}
                            onSelect={() => {
                              const currentValue = field.value || [];
                              const newValue = currentValue.includes(muscle)
                                ? currentValue.filter((m) => m !== muscle)
                                : [...currentValue, muscle];
                              form.setValue(
                                "primary_muscles_targeted",
                                newValue
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                (field.value || []).includes(muscle)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {muscle}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Wybierz jedną lub więcej partii mięśniowych.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opis (opcjonalnie)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Opisz technikę, wskazówki..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? pendingButtonText : buttonText}
        </Button>
      </form>
    </Form>
  );
}

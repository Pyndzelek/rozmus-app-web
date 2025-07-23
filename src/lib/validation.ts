import { z } from "zod";

// Definicja schematu walidacji Zod dla nowego ćwiczenia
export const exerciseSchema = z.object({
  name: z.string().min(3, "Nazwa musi mieć co najmniej 3 znaki."),
  description: z.string().optional(),
  category: z.enum(["Siła", "Kardio", "Mobilność", "Inna"]),
  primary_muscles_targeted: z.array(z.string()).optional(),
  // Dodać image_url i video_url jeśli chcesz je w formularzu
});

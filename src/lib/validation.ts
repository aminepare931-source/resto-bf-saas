import { z } from "zod";

const phoneRegex = /^[+0-9\s().-]{6,20}$/;

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Nom requis (2+ caractères)").max(80),
    city: z.string().trim().min(2, "Ville requise").max(60),
    cuisine: z.string().trim().min(2).max(60),
    ownerName: z.string().trim().min(2, "Nom du gérant requis").max(80),
    phone: z.string().trim().regex(phoneRegex, "Téléphone invalide"),
    email: z.string().trim().email("Email invalide").max(200),
    password: z
      .string()
      .min(8, "Mot de passe : 8 caractères minimum")
      .max(72)
      .regex(/[A-Za-z]/, "Doit contenir une lettre")
      .regex(/[0-9]/, "Doit contenir un chiffre"),
    confirm: z.string().min(8, "Mot de passe : 8 caractères minimum"),
    accept: z.literal(true, { errorMap: () => ({ message: "Acceptez les conditions" }) }),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Les mots de passe ne correspondent pas",
  });

export const reservationSchema = z.object({
  customer_name: z.string().trim().min(2).max(80),
  customer_phone: z.string().trim().regex(phoneRegex, "Téléphone invalide"),
  party_size: z.number().int().min(1).max(50),
  reservation_date: z.string().min(8),
  reservation_time: z.string().min(4),
  notes: z.string().max(500).optional().nullable(),
});

export const orderItemSchema = z.object({
  menu_item_id: z.string().uuid(),
  name: z.string().min(1).max(120),
  price: z.number().nonnegative().max(1_000_000),
  qty: z.number().int().min(1).max(50),
});

export const orderSchema = z.object({
  restaurant_id: z.string().uuid(),
  table_number: z.string().trim().max(20).nullable().optional(),
  customer_name: z.string().trim().max(80).optional().nullable(),
  customer_phone: z.string().trim().regex(phoneRegex).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  items: z.array(orderItemSchema).min(1).max(50),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;

export function firstZodError(err: z.ZodError) {
  return err.errors[0]?.message ?? "Données invalides";
}
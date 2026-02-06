import { z } from "zod";

const waterTypes = [
  "lake",
  "river",
  "sea",
  "pond",
  "stream",
  "ocean",
  "other",
] as const;

// Catch creation
export const createCatchSchema = z.object({
  location_text: z.string().max(200).optional(),
  water_type: z.enum(waterTypes).optional(),
  gear_notes: z.string().max(500).optional(),
});

// Tackle advice request
export const tackleAdviceSchema = z.object({
  rod: z.string().max(200).optional(),
  reel: z.string().max(200).optional(),
  line_type: z.string().max(100).optional(),
  line_strength_lb: z.number().min(0).max(500).optional(),
  hook_type: z.string().max(100).optional(),
  hook_size: z.string().max(50).optional(),
  bait_or_lure: z.string().max(200).optional(),
  target_species: z.string().max(100).optional(),
  water_type: z.enum(waterTypes).optional(),
  notes: z.string().max(500).optional(),
});

// Weather advice request
export const weatherAdviceSchema = z.object({
  city: z.string().min(1).max(100),
  country: z.string().max(100).optional(),
  water_type: z.enum(waterTypes).optional(),
  target_species: z.string().max(100).optional(),
});

// Chat message
export const chatMessageSchema = z.object({
  session_id: z.string().uuid().optional(),
  content: z.string().min(1).max(2000),
});

// Profile update
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, hyphens, underscores")
    .optional(),
  display_name: z.string().min(1).max(50).optional(),
  bio: z.string().max(300).optional(),
});

// Gear loadout
export const gearLoadoutSchema = z.object({
  name: z.string().min(1).max(100),
  rod: z.string().max(200).optional(),
  reel: z.string().max(200).optional(),
  line_type: z.string().max(100).optional(),
  line_strength_lb: z.number().min(0).max(500).optional(),
  hook_type: z.string().max(100).optional(),
  hook_size: z.string().max(50).optional(),
  bait_or_lure: z.string().max(200).optional(),
  target_species: z.string().max(100).optional(),
  water_type: z.enum(waterTypes).optional(),
  notes: z.string().max(500).optional(),
});

import { z } from "zod";

export const addAddressSchema = z.object({
  street: z
    .string({ required_error: "Street address is required" })
    .trim()
    .min(5, "Street must be at least 5 characters"),
  city: z
    .string({ required_error: "City is required" })
    .trim()
    .min(2, "City must be at least 2 characters"),
  state: z
    .string({ required_error: "State is required" })
    .trim()
    .min(2, "State must be at least 2 characters"),
  zipCode: z
    .string({ required_error: "Zip code is required" })
    .trim()
    .min(4, "Zip code must be at least 4 characters")
    .max(10, "Zip code cannot exceed 10 characters"),
  country: z
    .string({ required_error: "Country is required" })
    .trim()
    .min(2, "Country must be at least 2 characters"),
});

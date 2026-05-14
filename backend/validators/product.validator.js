import { z } from "zod";

export const addProductSchema = z.object({
  name: z
    .string({ required_error: "Product name is required" })
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name cannot exceed 100 characters"),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(10, "Description must be at least 10 characters"),
  price: z
    .number({ required_error: "Price is required", coerce: true })
    .positive("Price must be greater than 0"),
  offerPrice: z
    .number({ required_error: "Offer price is required", coerce: true })
    .positive("Offer price must be greater than 0"),
  category: z
    .string({ required_error: "Category is required" })
    .trim()
    .min(1, "Category is required"),
});

export const updateProductSchema = z.object({
  id: z.string({ required_error: "Product ID is required" }),
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().min(10).optional(),
  price: z.number({ coerce: true }).positive().optional(),
  offerPrice: z.number({ coerce: true }).positive().optional(),
  category: z.string().trim().optional(),
});

export const productIdSchema = z.object({
  id: z.string({ required_error: "Product ID is required" }),
});

export const reviewSchema = z.object({
  productId: z.string({ required_error: "Product ID is required" }),
  rating: z
    .number({ required_error: "Rating is required", coerce: true })
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z
    .string({ required_error: "Comment is required" })
    .trim()
    .min(3, "Comment must be at least 3 characters")
    .max(500, "Comment cannot exceed 500 characters"),
});

export const stockSchema = z.object({
  id: z.string({ required_error: "Product ID is required" }),
  inStock: z.boolean({ required_error: "Stock status is required" }),
});

import { z } from "zod";

export const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.string({ required_error: "Product ID is required" }),
        quantity: z
          .number({ required_error: "Quantity is required", coerce: true })
          .int()
          .positive("Quantity must be at least 1"),
      })
    )
    .min(1, "Order must contain at least one item"),
  address: z.string({ required_error: "Delivery address is required" }),
  couponCode: z.string().optional(),
  discountAmount: z.number().optional(),
});

export const updateStatusSchema = z.object({
  orderId: z.string({ required_error: "Order ID is required" }),
  status: z.enum(
    ["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
    { required_error: "Status is required", message: "Invalid order status" }
  ),
});

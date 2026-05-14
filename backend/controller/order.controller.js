import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { applyCouponUsage } from "./coupon.controller.js";
import { getIO } from "../config/socket.js";
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from "../services/email.service.js";
import User from "../models/user.model.js";

// Place order COD: /api/order/cod
export const placeOrderCOD = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { items, address, couponCode, discountAmount } = req.body;

  if (!address || !items || items.length === 0) {
    throw new AppError("Invalid order details", 400);
  }

  // Step 1: Validate all products exist and check stock BEFORE starting transaction
  let amount = 0;
  const stockUpdates = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new AppError(`Product not found: ${item.product}`, 404);
    }
    if (product.stockQuantity < item.quantity) {
      throw new AppError(
        `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
        400
      );
    }
    amount += product.offerPrice * item.quantity;
    stockUpdates.push({ productId: item.product, quantity: item.quantity });
  }

  // Add 2% tax
  amount += Math.floor((amount * 2) / 100);

  // Subtract discount if provided (Note: server validation of the exact discount could be re-run here for strict security)
  if (discountAmount && discountAmount > 0) {
    amount -= discountAmount;
    amount = Math.max(0, amount);
  }

  // Step 2: Use a transaction to atomically decrement stock and create order
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Atomically decrement stock for each product
    for (const update of stockUpdates) {
      const result = await Product.findOneAndUpdate(
        { _id: update.productId, stockQuantity: { $gte: update.quantity } },
        { $inc: { stockQuantity: -update.quantity } },
        { new: true, session }
      );

      if (!result) {
        throw new AppError("Stock changed during checkout. Please try again.", 409);
      }

      // Sync inStock flag
      if (result.stockQuantity === 0) {
        result.inStock = false;
        await result.save({ session });
      }
    }

    // Create the order
    const [newOrder] = await Order.create(
      [{
        userId,
        items,
        address,
        amount,
        paymentType: "COD",
        isPaid: false,
      }],
      { session }
    );

    // Apply coupon usage tracking
    if (couponCode) {
      await applyCouponUsage(couponCode, userId);
    }

    await session.commitTransaction();

    // Emit real-time notification to sellers
    const io = getIO();
    io.to("sellers").emit("newOrder", {
      message: "A new order has been placed",
      amount,
    });

    const user = await User.findById(userId);
    if (user) {
       sendOrderConfirmationEmail(user.email, newOrder._id, amount);
    }

    sendSuccess(res, 201, {}, "Order placed successfully");
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Get orders for individual user: /api/order/user
export const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orders = await Order.find({
    userId,
    $or: [{ paymentType: "COD" }, { isPaid: true }],
  })
    .populate("items.product address")
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, { orders });
});

// Get all orders for seller: /api/order/all
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    $or: [{ paymentType: "COD" }, { isPaid: true }],
  })
    .populate("items.product address")
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, { orders });
});

// Update order status: /api/order/status
export const updateStatus = asyncHandler(async (req, res) => {
  const { orderId, status } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Restore stock if order is being cancelled
  if (status === "Cancelled" && order.status !== "Cancelled") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity },
      });
      // Re-mark as in stock
      await Product.findByIdAndUpdate(item.product, { inStock: true });
    }
  }

  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    note: `Status updated to ${status}`,
  });

  // Mark as paid if delivered
  if (status === "Delivered" && order.paymentType === "COD") {
    order.isPaid = true;
  }

  await order.save();

  // Emit real-time notification to the user
  const io = getIO();
  io.to(`user_${order.userId}`).emit("orderStatusUpdate", {
    orderId: order._id,
    status: order.status,
    message: `Your order status has been updated to: ${status}`,
  });

  const user = await User.findById(order.userId);
  if (user) {
    sendOrderStatusEmail(user.email, order._id, status);
  }

  sendSuccess(res, 200, { order }, "Status updated successfully");
});

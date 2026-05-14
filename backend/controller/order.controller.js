import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { applyCouponUsage } from "./coupon.controller.js";
import { getIO } from "../config/socket.js";
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from "../services/email.service.js";
import User from "../models/user.model.js";
export const placeOrderCOD = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { items, address, couponCode, discountAmount } = req.body;
  if (!address || !items || items.length === 0) {
    throw new AppError("Invalid order details", 400);
  }
  let amount = 0;
  const stockUpdates = [];
  for (const item of items) {
    const productObjectId = new mongoose.Types.ObjectId(item.product);
    const product = await Product.findById(productObjectId);
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
    stockUpdates.push({ productId: productObjectId, quantity: item.quantity });
    
    // Mutate the original item so Order.create uses the ObjectId natively
    item.product = productObjectId;
  }
  amount += Math.floor((amount * 2) / 100);
  if (discountAmount && discountAmount > 0) {
    amount -= discountAmount;
    amount = Math.max(0, amount);
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const update of stockUpdates) {
      const result = await Product.findOneAndUpdate(
        { _id: update.productId, stockQuantity: { $gte: update.quantity } },
        { $inc: { stockQuantity: -update.quantity } },
        { new: true, session }
      );
      if (!result) {
        throw new AppError("Stock changed during checkout. Please try again.", 409);
      }
      if (result.stockQuantity === 0) {
        result.inStock = false;
        await result.save({ session });
      }
    }
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
    if (couponCode) {
      await applyCouponUsage(couponCode, userId);
    }
    await session.commitTransaction();
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
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    $or: [{ paymentType: "COD" }, { isPaid: true }],
  })
    .populate("items.product address")
    .sort({ createdAt: -1 });
  sendSuccess(res, 200, { orders });
});
export const updateStatus = asyncHandler(async (req, res) => {
  const { orderId, status } = req.body;
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  if (status === "Cancelled" && order.status !== "Cancelled") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity },
      });
      await Product.findByIdAndUpdate(item.product, { inStock: true });
    }
  }
  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    note: `Status updated to ${status}`,
  });
  if (status === "Delivered" && order.paymentType === "COD") {
    order.isPaid = true;
  }
  await order.save();
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

import jwt from "jsonwebtoken";
import Seller from "../models/seller.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
export const registerSeller = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existingSeller = await Seller.findOne({ email });
  if (existingSeller) {
    throw new AppError("Seller already exists with this email", 400);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newSeller = await Seller.create({ name, email, password: hashedPassword });
  const token = jwt.sign({ id: newSeller._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("sellerToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  sendSuccess(res, 201, {}, "Seller created successfully");
});
export const sellerLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (
    email === process.env.SELLER_EMAIL &&
    password === process.env.SELLER_PASSWORD
  ) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("sellerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return sendSuccess(res, 200, {}, "Login successful");
  }
  const seller = await Seller.findOne({ email });
  if (!seller) {
    throw new AppError("Invalid credentials", 401);
  }
  const isMatch = await bcrypt.compare(password, seller.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }
  const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("sellerToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  sendSuccess(res, 200, {}, "Login successful");
});
export const checkAuth = asyncHandler(async (req, res) => {
  sendSuccess(res, 200);
});
export const sellerLogout = asyncHandler(async (req, res) => {
  res.clearCookie("sellerToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
  });
  sendSuccess(res, 200, {}, "Logged out successfully");
});
export const getSellerAnalytics = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const orders = await Order.find({
    $or: [{ paymentType: "COD" }, { isPaid: true }],
  });
  const totalSales = orders.reduce((acc, order) => acc + order.amount, 0);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const salesData = await Order.aggregate([
    {
      $match: {
        $or: [{ paymentType: "COD" }, { isPaid: true }],
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        amount: { $sum: "$amount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const categoryRevenue = await Order.aggregate([
    { $match: { $or: [{ paymentType: "COD" }, { isPaid: true }] } },
    { $unwind: "$items" },
    { $addFields: { "items.product": { $toObjectId: "$items.product" } } },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $group: {
        _id: "$productDetails.category",
        revenue: { $sum: { $multiply: ["$productDetails.offerPrice", "$items.quantity"] } },
        count: { $sum: "$items.quantity" },
      },
    },
    { $sort: { revenue: -1 } },
  ]);
  const topProducts = await Order.aggregate([
    { $match: { $or: [{ paymentType: "COD" }, { isPaid: true }] } },
    { $unwind: "$items" },
    { $addFields: { "items.product": { $toObjectId: "$items.product" } } },
    {
      $group: {
        _id: "$items.product",
        totalSold: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        name: "$product.name",
        totalSold: 1,
        image: { $arrayElemAt: ["$product.image", 0] },
      },
    },
  ]);
  const orderStatusBreakdown = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
  sendSuccess(res, 200, {
    stats: { totalProducts, totalOrders, totalSales },
    salesData,
    categoryRevenue,
    topProducts,
    orderStatusBreakdown,
  });
});

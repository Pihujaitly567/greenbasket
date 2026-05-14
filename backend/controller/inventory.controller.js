import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
export const restockProduct = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity || quantity <= 0) {
    throw new AppError("Product ID and a positive quantity are required", 400);
  }
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  product.stockQuantity += quantity;
  product.inStock = true;
  await product.save();
  sendSuccess(res, 200, {
    product: {
      _id: product._id,
      name: product.name,
      stockQuantity: product.stockQuantity,
      inStock: product.inStock,
    },
  }, `Restocked ${quantity} units of ${product.name}`);
});
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = parseInt(req.query.threshold) || 10;
  const products = await Product.find({ stockQuantity: { $lte: threshold } })
    .select("name category stockQuantity inStock image")
    .sort({ stockQuantity: 1 });
  sendSuccess(res, 200, {
    products,
    count: products.length,
    threshold,
  });
});
export const getInventoryOverview = asyncHandler(async (req, res) => {
  const stats = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalStock: { $sum: "$stockQuantity" },
        outOfStock: {
          $sum: { $cond: [{ $lte: ["$stockQuantity", 0] }, 1, 0] },
        },
        lowStock: {
          $sum: { $cond: [{ $and: [{ $gt: ["$stockQuantity", 0] }, { $lte: ["$stockQuantity", 10] }] }, 1, 0] },
        },
        avgStock: { $avg: "$stockQuantity" },
      },
    },
  ]);
  const categoryStock = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        totalStock: { $sum: "$stockQuantity" },
        productCount: { $sum: 1 },
      },
    },
    { $sort: { totalStock: -1 } },
  ]);
  sendSuccess(res, 200, {
    stats: stats[0] || { totalProducts: 0, totalStock: 0, outOfStock: 0, lowStock: 0, avgStock: 0 },
    categoryStock,
  });
});

import Coupon from "../models/coupon.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code, description, discountType, discountValue,
    minOrderAmount, maxDiscountAmount, maxUses,
    perUserLimit, applicableCategories, startsAt, expiresAt,
  } = req.body;
  if (!code || !discountType || !discountValue || !expiresAt) {
    throw new AppError("Code, discount type, discount value, and expiry date are required", 400);
  }
  if (discountType === "percentage" && (discountValue < 1 || discountValue > 100)) {
    throw new AppError("Percentage discount must be between 1 and 100", 400);
  }
  if (new Date(expiresAt) <= new Date()) {
    throw new AppError("Expiry date must be in the future", 400);
  }
  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing) {
    throw new AppError("A coupon with this code already exists", 400);
  }
  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    minOrderAmount: minOrderAmount || 0,
    maxDiscountAmount: maxDiscountAmount || null,
    maxUses: maxUses || null,
    perUserLimit: perUserLimit || 1,
    applicableCategories: applicableCategories || [],
    startsAt: startsAt || new Date(),
    expiresAt,
  });
  sendSuccess(res, 201, { coupon }, "Coupon created successfully");
});
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount, categories } = req.body;
  const userId = req.user._id;
  if (!code) {
    throw new AppError("Coupon code is required", 400);
  }
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) {
    throw new AppError("Invalid or inactive coupon code", 400);
  }
  if (new Date() < new Date(coupon.startsAt)) {
    throw new AppError("This coupon is not active yet", 400);
  }
  if (new Date() > new Date(coupon.expiresAt)) {
    throw new AppError("This coupon has expired", 400);
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new AppError("This coupon has reached its maximum usage limit", 400);
  }
  const userUsageCount = coupon.usedBy.filter(
    (u) => u.userId.toString() === userId.toString()
  ).length;
  if (userUsageCount >= coupon.perUserLimit) {
    throw new AppError("You have already used this coupon the maximum number of times", 400);
  }
  if (orderAmount && orderAmount < coupon.minOrderAmount) {
    throw new AppError(
      `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
      400
    );
  }
  if (coupon.applicableCategories.length > 0 && categories && categories.length > 0) {
    const applicableItems = categories.some((cat) =>
      coupon.applicableCategories.includes(cat)
    );
    if (!applicableItems) {
      throw new AppError(
        `This coupon is only valid for: ${coupon.applicableCategories.join(", ")}`,
        400
      );
    }
  }
  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = Math.floor((orderAmount * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount !== null) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    discount = coupon.discountValue;
  }
  discount = Math.min(discount, orderAmount || 0);
  sendSuccess(res, 200, {
    valid: true,
    discount,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description,
    },
  }, `Coupon applied! You save ₹${discount}`);
});
export const applyCouponUsage = async (couponCode, userId) => {
  if (!couponCode) return;
  await Coupon.findOneAndUpdate(
    { code: couponCode.toUpperCase() },
    {
      $inc: { usedCount: 1 },
      $push: { usedBy: { userId, usedAt: new Date() } },
    }
  );
};
export const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  sendSuccess(res, 200, { coupons });
});
export const deactivateCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.body;
  const coupon = await Coupon.findByIdAndUpdate(
    couponId,
    { isActive: false },
    { new: true }
  );
  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }
  sendSuccess(res, 200, { coupon }, "Coupon deactivated");
});
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.body;
  const coupon = await Coupon.findByIdAndDelete(couponId);
  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }
  sendSuccess(res, 200, {}, "Coupon deleted");
});

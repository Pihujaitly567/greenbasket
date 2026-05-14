import express from "express";
import { authSeller } from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";
import {
  createCoupon,
  validateCoupon,
  listCoupons,
  deactivateCoupon,
  deleteCoupon,
} from "../controller/coupon.controller.js";

const router = express.Router();

// User routes
router.post("/validate", authUser, validateCoupon);

// Seller routes
router.post("/create", authSeller, createCoupon);
router.get("/list", authSeller, listCoupons);
router.post("/deactivate", authSeller, deactivateCoupon);
router.post("/delete", authSeller, deleteCoupon);

export default router;

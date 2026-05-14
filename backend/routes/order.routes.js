import express from "express";
import authUser from "../middlewares/authUser.js";
import {
  getAllOrders,
  getUserOrders,
  placeOrderCOD,
  updateStatus,
} from "../controller/order.controller.js";
import { authSeller } from "../middlewares/authSeller.js";
import validate from "../middlewares/validate.js";
import { placeOrderSchema, updateStatusSchema } from "../validators/order.validator.js";

const router = express.Router();

router.post("/cod", authUser, validate(placeOrderSchema), placeOrderCOD);
router.get("/user", authUser, getUserOrders);
router.get("/seller", authSeller, getAllOrders);
router.post("/status", authSeller, validate(updateStatusSchema), updateStatus);

export default router;

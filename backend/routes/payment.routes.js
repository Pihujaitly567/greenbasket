import express from "express";
import { createOrder, verifyPayment } from "../controller/payment.controller.js";
import authUser from "../middlewares/authUser.js";

const router = express.Router();

router.post("/create-order", authUser, createOrder);
router.post("/verify-payment", authUser, verifyPayment);

export default router;

import express from "express";
import { createReview, getProductReviews } from "../controller/review.controller.js";
import authUser from "../middlewares/authUser.js";
const router = express.Router();
router.post("/", authUser, createReview);
router.get("/:productId", getProductReviews);
export default router;

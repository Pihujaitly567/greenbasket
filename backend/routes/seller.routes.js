import express from "express";
import {
  checkAuth,
  sellerLogin,
  sellerLogout,
  registerSeller,
  getSellerAnalytics,
} from "../controller/seller.controller.js";
import { authSeller } from "../middlewares/authSeller.js";
const router = express.Router();

router.post("/register", registerSeller);
router.post("/login", sellerLogin);
router.get("/is-auth", authSeller, checkAuth);
router.get("/logout", authSeller, sellerLogout);
router.get("/analytics", authSeller, getSellerAnalytics);

export default router;

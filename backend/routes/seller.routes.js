import express from "express";
import {
  checkAuth,
  sellerLogin,
  sellerLogout,
  registerSeller,
  getSellerAnalytics,
} from "../controller/seller.controller.js";
import { authSeller } from "../middlewares/authSeller.js";
import validate from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../validators/user.validator.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerSeller);
router.post("/login", validate(loginSchema), sellerLogin);
router.get("/is-auth", authSeller, checkAuth);
router.get("/logout", authSeller, sellerLogout);
router.get("/analytics", authSeller, getSellerAnalytics);

export default router;

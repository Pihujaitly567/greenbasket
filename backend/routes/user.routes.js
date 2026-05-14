import express from "express";
import {
  checkAuth,
  loginUser,
  logout,
  registerUser,
} from "../controller/user.controller.js";
import authUser from "../middlewares/authUser.js";
import validate from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../validators/user.validator.js";
const router = express.Router();
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.get("/is-auth", authUser, checkAuth);
router.get("/logout", authUser, logout);
export default router;

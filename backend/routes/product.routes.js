import express from "express";

import { authSeller } from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";
import {
  addProduct,
  addProductReview,
  changeStock,
  getProductById,
  seedProducts,
  getProducts,
  deleteProduct,
  updateProduct,
} from "../controller/product.controller.js";
import { upload } from "../config/multer.js";
const router = express.Router();

router.post("/add-product", authSeller, upload.array("image", 4), addProduct);
router.get("/list", getProducts);
router.get("/id", getProductById);
router.post("/stock", authSeller, changeStock);
router.post("/review", authUser, addProductReview);
router.post("/seed", seedProducts);
router.post("/delete", authSeller, deleteProduct);
router.post("/update", authSeller, upload.array("image", 4), updateProduct);

export default router;

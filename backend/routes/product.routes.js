import express from "express";
import { authSeller } from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";
import {
  addProduct,
  changeStock,
  getProductById,
  seedProducts,
  getProducts,
  deleteProduct,
  updateProduct,
} from "../controller/product.controller.js";
import { upload } from "../config/multer.js";
import validate from "../middlewares/validate.js";
import {
  productIdSchema,
  reviewSchema,
  stockSchema,
} from "../validators/product.validator.js";
const router = express.Router();
router.post("/add-product", authSeller, upload.array("image", 4), addProduct);
router.get("/list", getProducts);
router.get("/id", getProductById);
router.post("/stock", authSeller, validate(stockSchema), changeStock);
router.post("/seed", authSeller, seedProducts); 
router.post("/delete", authSeller, validate(productIdSchema), deleteProduct);
router.post("/update", authSeller, upload.array("image", 4), updateProduct);
export default router;

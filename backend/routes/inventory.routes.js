import express from "express";
import { authSeller } from "../middlewares/authSeller.js";
import {
  restockProduct,
  getLowStockProducts,
  getInventoryOverview,
} from "../controller/inventory.controller.js";
const router = express.Router();
router.post("/restock", authSeller, restockProduct);
router.get("/low-stock", authSeller, getLowStockProducts);
router.get("/overview", authSeller, getInventoryOverview);
export default router;

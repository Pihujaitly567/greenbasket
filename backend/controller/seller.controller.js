import jwt from "jsonwebtoken";
import Seller from "../models/seller.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import bcrypt from "bcryptjs";

// seller register : /api/seller/register
export const registerSeller = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.json({ success: false, message: "Seller already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSeller = new Seller({ name, email, password: hashedPassword });
    await newSeller.save();

    const token = jwt.sign({ id: newSeller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("sellerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Seller created successfully" });
  } catch (error) {
    console.error("Error in registerSeller:", error);
    res.json({ success: false, message: error.message });
  }
};

// seller login :/api/seller/login
export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check hardcoded admin as fallback (optional, but requested to keep admin access likely)
    if (
      email === process.env.SELLER_EMAIL &&
      password === process.env.SELLER_PASSWORD
    ) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.cookie("sellerToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({ success: true, message: "Login successful" });
    }

    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("sellerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Error in sellerLogin:", error);
    res.json({ success: false, message: "Internal server error" });
  }
};

// check seller auth  : /api/seller/is-auth
export const checkAuth = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error in checkAuth:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// logout seller: /api/seller/logout
export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
    });
    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// get seller analytics /api/seller/analytics
export const getSellerAnalytics = async (req, res) => {
  try {
    // Basic stats
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate total sales
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    });
    const totalSales = orders.reduce((acc, order) => acc + order.amount, 0);

    // Get daily sales for the last 7 days for the chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesData = await Order.aggregate([
      {
        $match: {
          $or: [{ paymentType: "COD" }, { isPaid: true }],
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$amount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format data for recharts (ensure all days are present or just return what we have)
    // For simplicity, returning the aggregated data

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalSales,
      },
      salesData,
    });
  } catch (error) {
    console.error("Error in getSellerAnalytics:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

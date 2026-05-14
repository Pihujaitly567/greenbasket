import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

// update user cartData: /api/cart/update
export const updateCart = asyncHandler(async (req, res) => {
  const userId = req.user;
  const { cartItems } = req.body;
  await User.findByIdAndUpdate(userId, { cartItems }, { new: true });
  sendSuccess(res, 200, {}, "Cart updated");
});

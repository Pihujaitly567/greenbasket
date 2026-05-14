import Address from "../models/address.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";

// add address: /api/address/add
export const addAddress = asyncHandler(async (req, res) => {
  const userId = req.user;
  const { address } = req.body;

  await Address.create({
    ...address,
    userId,
  });

  sendSuccess(res, 201, {}, "Address added successfully");
});

// get addresses: /api/address/get
export const getAddress = asyncHandler(async (req, res) => {
  const userId = req.user;
  const addresses = await Address.find({ userId });
  sendSuccess(res, 200, { addresses });
});

// delete address: /api/address/delete/:id
export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user;

  const address = await Address.findOneAndDelete({ _id: id, userId });
  if (!address) {
    throw new AppError("Address not found", 404);
  }

  sendSuccess(res, 200, {}, "Address deleted successfully");
});

import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    amount: { type: Number, required: true },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Address",
    },
    status: {
      type: String,
      enum: ["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Order Placed",
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    paymentType: {
      type: String,
      required: true,
      enum: ["COD", "Online"],
    },
    isPaid: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);
orderSchema.pre("save", function (next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: "Order placed",
    });
  }
  next();
});
const Order = mongoose.model("Order", orderSchema);
export default Order;

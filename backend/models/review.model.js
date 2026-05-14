import mongoose from "mongoose";
import Product from "./product.model.js";
const reviewSchema = mongoose.Schema(
  {
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      numReviews: stats[0].nRating,
      rating: Math.round(stats[0].avgRating * 10) / 10, 
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      numReviews: 0,
      rating: 0,
    });
  }
};
reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.product);
});
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.product);
  }
});
const Review = mongoose.model("Review", reviewSchema);
export default Review;

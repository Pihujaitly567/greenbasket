import mongoose from "mongoose";


const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    offerPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: [String],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      default: 50,
      min: 0,
    },
    priceHistory: [
      {
        price: Number,
        offerPrice: Number,
        changedAt: { type: Date, default: Date.now },
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Keep inStock in sync with stockQuantity
productSchema.pre("save", function (next) {
  this.inStock = this.stockQuantity > 0;
  next();
});

// Virtual populate for reviews
productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

// Ensure virtuals are included when converting to JSON/Object
productSchema.set("toObject", { virtuals: true });
productSchema.set("toJSON", { virtuals: true });


const Product = mongoose.model("Product", productSchema);
export default Product;

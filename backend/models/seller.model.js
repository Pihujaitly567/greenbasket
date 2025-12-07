import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },
    { minimize: false }
);

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;

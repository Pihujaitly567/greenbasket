import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log("MONGO_URI exists:", !!mongoUri);
    console.log("MONGO_URI starts with:", mongoUri ? mongoUri.substring(0, 20) : "undefined");

    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not set");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

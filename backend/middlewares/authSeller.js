import jwt from "jsonwebtoken";
export const authSeller = async (req, res, next) => {
  const { sellerToken } = req.cookies;
  if (!sellerToken) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
  try {
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
    // Allow if decoded has an ID (DB seller) OR if email matches env (Hardcoded admin)
    if (decoded.id || decoded.email === process.env.SELLER_EMAIL) {
      return next();
    } else {
      return res.json({ success: false, message: "Forbidden" });
    }
  } catch (error) {
    console.error("Error in authSeller middleware:", error);
    return res.status(401).json({ message: "Invalid token", success: false });
  }
};

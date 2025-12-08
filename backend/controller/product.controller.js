import Product from "../models/product.model.js";

// add product :/api/product/add
export const addProduct = async (req, res) => {
  try {
    const { name, price, offerPrice, description, category } = req.body;
    // const image = req.files?.map((file) => `/uploads/${file.filename}`);
    const image = req.files?.map((file) => file.filename);
    if (
      !name ||
      !price ||
      !offerPrice ||
      !description ||
      !category ||
      !image ||
      image.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields including images are required",
      });
    }

    const product = new Product({
      name,
      price,
      offerPrice,
      description,
      category,
      image,
    });

    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      product: savedProduct,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error in addProduct:", error);

    return res
      .status(500)
      .json({ success: false, message: "Server error while adding product" });
  }
};

// get products :/api/product/list
// Supports: pagination (page, limit), search (q), filter (category), sort (sort)
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search query
    const searchQuery = req.query.q || "";
    // Category filter
    const categoryFilter = req.query.category || "";
    // Sort: "price_asc", "price_desc", "newest", "oldest"
    const sortParam = req.query.sort || "newest";

    // Build filter object
    let filter = {};

    // Search by name (case-insensitive)
    if (searchQuery) {
      filter.name = { $regex: searchQuery, $options: "i" };
    }

    // Filter by category
    if (categoryFilter) {
      filter.category = { $regex: categoryFilter, $options: "i" };
    }

    // Build sort object
    let sortObj = {};
    switch (sortParam) {
      case "price_asc":
        sortObj = { offerPrice: 1 };
        break;
      case "price_desc":
        sortObj = { offerPrice: -1 };
        break;
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).sort(sortObj).skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// get single product :/api/product/id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// change stock  :/api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    const product = await Product.findByIdAndUpdate(
      id,
      { inStock },
      { new: true }
    );
    res
      .status(200)
      .json({ success: true, product, message: "Stock updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// create review :/api/product/review
export const addProductReview = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;

    // Check if req.user exists (from auth middleware)
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const product = await Product.findById(productId);

    if (product) {
      // Check if user already reviewed
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ success: false, message: "Product already reviewed" });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ success: true, message: "Review added" });
    } else {
      res.status(404).json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// seed products :/api/product/seed
export const seedProducts = async (req, res) => {
  try {
    const products = [
      // Vegetables
      { name: "Fresh Tomatoes", price: 40, offerPrice: 35, description: "Red juicy organic tomatoes", category: "Vegetables", image: ["1749178557738veg.png"] },
      { name: "Green Bell Pepper", price: 60, offerPrice: 50, description: "Crunchy green capsicum", category: "Vegetables", image: ["1749178617827veg.png"] },
      { name: "Carrots", price: 45, offerPrice: 40, description: "Sweet orange roots", category: "Vegetables", image: ["1749178832436veg.png"] },
      { name: "Spinach Bunch", price: 25, offerPrice: 20, description: "Fresh leafy green spinach", category: "Vegetables", image: ["1749178973412veg.png"] },

      // Fruits
      { name: "Red Apples", price: 120, offerPrice: 100, description: "Crisp and sweet red apples", category: "Fruits", image: ["17651206662852ff3baa615e3283505d76da175e29fad.png"] },
      { name: "Fresh Oranges", price: 80, offerPrice: 70, description: "Vitamin C packed citrus", category: "Fruits", image: ["1765121337207orange-juice.webp"] },
      { name: "Strawberries", price: 200, offerPrice: 180, description: "Sweet red berries", category: "Fruits", image: ["1765118741750212fc969a4be330d86a54c25fd7e574b.png"] },
      { name: "Banana Bunch", price: 50, offerPrice: 40, description: "Energy boosting yellow fruit", category: "Fruits", image: ["1765118858283023a6f890a1ec108526d41b5e29008a9.png"] },

      // Organic Jams
      { name: "Mixed Berry Jam", price: 250, offerPrice: 220, description: "Artisanal mixed berry preserve", category: "Organic-Jams", image: ["17651212235141720254649_jam_mixedberry_500gm_png00.png"] },
      { name: "Strawberry Jam", price: 240, offerPrice: 210, description: "Classic sweet strawberry spread", category: "Organic-Jams", image: ["17651212235141720254649_jam_mixedberry_500gm_png00.png"] },
      { name: "Apricot Jam", price: 260, offerPrice: 230, description: "Tangy and sweet apricot jam", category: "Organic-Jams", image: ["17651212235141720254649_jam_mixedberry_500gm_png00.png"] },

      // Cold Beverages
      { name: "Coconut Water", price: 60, offerPrice: 55, description: "Refreshing natural electrolyte drink", category: "Cold-Beverages", image: ["1765130740161refreshing-coconut-water-captured-dewy-bottle-evoking-tropical-tranquility-natural-vitality-experience-clear-sparkles-387020697.webp"] },
      { name: "Orange Juice", price: 90, offerPrice: 85, description: "Freshly squeezed pulp-free juice", category: "Cold-Beverages", image: ["1765121337207orange-juice.webp"] },
      { name: "Mango Iced Tea", price: 70, offerPrice: 65, description: "Cool mango infused tea", category: "Cold-Beverages", image: ["17651308282683VeE2VJn7u3UWjHzPF2VP0aE0.png"] },

      // Healthy Snacks
      { name: "Multigrain Chips", price: 50, offerPrice: 45, description: "Baked healthy crunch", category: "Healthy-Snacks", image: ["1765131158620RoastedMultigrainChips1_1024x.webp"] },
      { name: "Roasted Almonds", price: 300, offerPrice: 280, description: "Salted premium californian almonds", category: "Healthy-Snacks", image: ["1765131158620RoastedMultigrainChips1_1024x.webp"] },
      { name: "Quinoa Puffs", price: 80, offerPrice: 75, description: "Light and airy cheesy puffs", category: "Healthy-Snacks", image: ["1765131158620RoastedMultigrainChips1_1024x.webp"] },

      // Dairy
      { name: "Organic Curd", price: 40, offerPrice: 38, description: "Thick creamy set curd", category: "Dairy", image: ["1765131613689100-pure-fresh-organic-curd-for-home-purpose-restaurant-food-beverage-931.jpg"] },
      { name: "Farm Milk", price: 60, offerPrice: 58, description: "Pure cow milk glass bottle", category: "Dairy", image: ["1765131613689100-pure-fresh-organic-curd-for-home-purpose-restaurant-food-beverage-931.jpg"] },
      { name: "Butter", price: 150, offerPrice: 140, description: "Salted table butter", category: "Dairy", image: ["1765131613689100-pure-fresh-organic-curd-for-home-purpose-restaurant-food-beverage-931.jpg"] },

      // Grains
      { name: "Brown Rice", price: 120, offerPrice: 110, description: "Whole grain brown rice 1kg", category: "Grains", image: ["1765131694753is-brown-rice-as-healthy-as-you-think-new-study-uncovers-concerning-toxic-arsenic-risk.webp"] },
      { name: "Quinoa", price: 200, offerPrice: 190, description: "White quinoa seeds 500g", category: "Grains", image: ["1765131810391quinoa-1243591_1920.avif"] },
      { name: "Oats", price: 90, offerPrice: 85, description: "Rolled oats for breakfast", category: "Grains", image: ["1765131694753is-brown-rice-as-healthy-as-you-think-new-study-uncovers-concerning-toxic-arsenic-risk.webp"] },

      // Bakery
      { name: "Whole Wheat Bread", price: 50, offerPrice: 45, description: "Freshly baked brown bread", category: "Bakery", image: ["1765131025499images (1).jpeg"] },
      { name: "Croissant", price: 70, offerPrice: 65, description: "Buttery flaky french pastry", category: "Bakery", image: ["1765131025499images (1).jpeg"] },
      { name: "Baguette", price: 60, offerPrice: 55, description: "Long crusty french loaf", category: "Bakery", image: ["1765131025499images (1).jpeg"] },
    ];

    await Product.insertMany(products);
    res.status(201).json({ success: true, message: "Database seeded with products" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// update product
export const updateProduct = async (req, res) => {
  try {
    const { id, name, description, category, price, offerPrice } = req.body;

    // Handle image update if files are provided
    let updateData = { name, description, category, price, offerPrice };
    if (req.files && req.files.length > 0) {
      const image = req.files.map((file) => file.filename);
      updateData.image = image;
    }

    await Product.findByIdAndUpdate(id, updateData);
    res.status(200).json({ success: true, message: "Product updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

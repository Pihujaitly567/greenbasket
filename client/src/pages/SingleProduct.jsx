import { useEffect, useState } from "react";
import { useAppContext } from "../context/appContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import axios from "axios";
import { toast } from "react-hot-toast";

const SingleProduct = () => {
  const { products, navigate, addToCart, backendUrl, fetchProducts } = useAppContext();
  const { id } = useParams();
  const [thumbnail, setThumbnail] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const product = products.find((product) => product._id === id);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/product/review",
        { rating, comment, productId: id },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        setRating(0);
        setComment("");
        fetchProducts(); // Refresh products to show new review
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting review");
    }
  };

  useEffect(() => {
    if (products.length > 0) {
      let productsCopy = products.slice();
      productsCopy = productsCopy.filter(
        (p) => p.category === product?.category && p._id !== product?._id
      );
      setRelatedProducts(productsCopy.slice(0, 5));
    }
  }, [products, product]);

  useEffect(() => {
    setThumbnail(product?.image[0] ? product.image[0] : null);
  }, [product]);
  return (
    product && (
      <div className="mt-16">
        <p>
          <Link to="/">Home</Link>/<Link to={"/products"}> Products</Link> /
          <Link to={`/products/${product.category.toLowerCase()}`}>
            {" "}
            {product.category}
          </Link>{" "}
          /<span className="text-indigo-500"> {product.name}</span>
        </p>

        <div className="flex flex-col md:flex-row gap-16 mt-4">
          <div className="flex gap-3">
            <div className="flex flex-col gap-3">
              {product.image.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setThumbnail(image)}
                  className="border max-w-24 w-24 h-24 border-gray-500/30 rounded overflow-hidden cursor-pointer flex items-center justify-center bg-white"
                >
                  <img
                    src={`${backendUrl}/images/${image}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>

            <div className="border border-gray-500/30 w-96 h-96 rounded overflow-hidden bg-white flex items-center justify-center">
              <img
                src={`${backendUrl}/images/${thumbnail}`}
                className="w-full h-full object-contain"
                alt="Selected product"
              />
            </div>
          </div>

          <div className="text-sm w-full md:w-1/2">
            <h1 className="text-3xl font-medium">{product.name}</h1>

            <div className="flex items-center gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => (
                <img
                  src={i < Math.round(product.rating || 0) ? assets.star_icon : assets.star_dull_icon}
                  alt="star"
                  key={i}
                  className="w-3.5 md:w-4"
                />
              ))}
              <p className="text-base ml-2">({product.numReviews || 0} reviews)</p>
            </div>

            <div className="mt-6">
              <p className="text-gray-500/70 line-through">
                MRP: ₹{product.price}
              </p>
              <p className="text-2xl font-medium">MRP: ₹{product.offerPrice}</p>
              <span className="text-gray-500/70">(inclusive of all taxes)</span>
            </div>

            <p className="text-base font-medium mt-6">About Product</p>
            <ul className="list-disc ml-4 text-gray-500/70">
              {product.description.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))}
            </ul>

            <div className="flex items-center mt-10 gap-4 text-base">
              <button
                onClick={() => addToCart(product._id)}
                className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  addToCart(product._id);
                  navigate("/cart");
                  scrollTo(0, 0);
                }}
                className="w-full py-3.5 cursor-pointer font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>
        {/* related prodcuts  */}
        <div className="flex flex-col items-center mt-20">
          <div className="flex flex-col items-center w-max">
            <p className="text-2xl font-medium">Related Products</p>
            <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
          </div>

          <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center justify-center">
            {relatedProducts
              .filter((product) => product.inStock)
              .map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
          </div>
          <button
            onClick={() => {
              navigate("/products");
              scrollTo(0, 0);
            }}
            className="w-1/2 my-8 py-3.5 cursor-pointer font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition"
          >
            See More
          </button>
        </div>

        {/* Reviews Section */}
        <div className="mt-20">
          <div className="flex flex-col items-center w-max mb-6">
            <p className="text-2xl font-medium">Reviews & Ratings</p>
            <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* List Reviews */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-medium">Customer Reviews</h3>
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review, index) => (
                  <div key={index} className="border p-4 rounded-md bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-yellow-500 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < review.rating ? "★" : "☆"}
                          </span>
                        ))}
                      </div>
                      <span className="font-medium text-gray-700">{review.name}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No reviews yet.</p>
              )}
            </div>

            {/* Write Review */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-medium">Write a Review</h3>
              <form onSubmit={submitReview} className="flex flex-col gap-4 border p-6 rounded-md shadow-sm bg-white">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl focus:outline-none transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Comment</label>
                  <textarea
                    className="border rounded-md p-2 w-full h-32 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Share your thoughts..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 transition disabled:opacity-50"
                  disabled={rating === 0}
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  );
};
export default SingleProduct;

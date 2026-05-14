import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
const ProductCard = ({ product }) => {
  const { addToCart, removeFromCart, cartItems, navigate, backendUrl } = useAppContext();
  return (
    product && (
      <div
        onClick={() => {
          navigate(
            `/product/${product.category.toLowerCase()}/${product?._id}`
          );
          scrollTo(0, 0);
        }}
        data-aos="fade-up"
        className="group flex flex-col border border-gray-100 rounded-xl px-4 py-3 bg-white w-full shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
      >
        <div className="relative flex items-center justify-center p-4 h-48 w-full bg-gray-50/50 rounded-lg mb-3 overflow-hidden">
          <img
            className="group-hover:scale-110 transition-transform duration-500 w-full h-full object-contain mix-blend-multiply"
            src={`${backendUrl}/images/${product.image[0]}`}
            alt={product.name}
          />
        </div>
        <div className="flex flex-col flex-1 text-sm">
          <p className="text-xs font-semibold tracking-wider text-green-600 uppercase mb-1">{product.category}</p>
          <p className="text-gray-800 font-bold text-base md:text-lg line-clamp-2 leading-snug h-12">
            {product.name}
          </p>
          <div className="flex items-center gap-1 mt-1 mb-2 opacity-90">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={i < Math.round(product.rating || 0) ? assets.star_icon : assets.star_dull_icon}
                alt="rating"
                className="w-3.5"
              />
            ))}
            <p className="text-xs text-gray-500 ml-1">({product.numReviews || 0})</p>
          </div>
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 line-through decoration-gray-300">
                ₹{product.price}
              </span>
              <p className="text-lg md:text-xl font-extrabold text-gray-900 leading-none">
                ₹{product.offerPrice}
              </p>
            </div>
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0"
            >
              {!cartItems?.[product?._id] ? (
                <button
                  onClick={() => addToCart(product?._id)}
                  className="flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-600 text-green-700 hover:text-white border border-green-200 hover:border-green-600 px-3 h-[36px] rounded-lg font-semibold transition-all shadow-sm active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add
                </button>
              ) : (
                <div className="flex items-center justify-center gap-1 w-[88px] h-[36px] bg-green-100 border border-green-300 rounded-lg select-none text-green-800 font-bold">
                  <button
                    onClick={() => removeFromCart(product?._id)}
                    className="cursor-pointer text-lg px-2 h-full hover:bg-green-200 rounded-l-lg transition-colors"
                  >
                    -
                  </button>
                  <span className="w-5 text-center text-sm">
                    {cartItems[product?._id]}
                  </span>
                  <button
                    onClick={() => addToCart(product?._id)}
                    className="cursor-pointer text-lg px-2 h-full hover:bg-green-200 rounded-r-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};
export default ProductCard;

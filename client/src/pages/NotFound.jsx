import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <img src={assets.leaf_icon} alt="Leaf" className="w-24 mb-6 opacity-60" />
      <h1 className="text-6xl font-extrabold text-green-700 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
      </p>
      <Link 
        to="/" 
        className="px-8 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition"
      >
        Back to Home
      </Link>
    </div>
  );
};
export default NotFound;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

// LOGO
import logo from "../assets/Green-Basket-logo1.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const {
    user,
    setUser,
    showUserLogin,
    setShowUserLogin,
    navigate,
    searchQuery,
    setSearchQuery,
    cartCount,
    axios,
  } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout");
      if (data.success) {
        setUser(null);
        navigate("/");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, []);

  return (
    <nav
      className="
      flex flex-col gap-2 px-6 md:px-16 lg:px-24 xl:px-32 py-4 
      border-b border-green-200 shadow-sm
      bg-[url('/src/assets/leaf_bg.svg')] bg-cover bg-no-repeat bg-left
      bg-green-50/60 backdrop-blur-md
      "
    >
      {/* TOP ROW */}
      <div className="flex items-center justify-between w-full relative">

        {/* FLOATING LEAVES (cute aesthetic) */}
        <img
          src={assets.leaf_icon}
          className="absolute left-1 top-1 w-4 opacity-60 rotate-[-20deg]"
        />
        <img
          src={assets.leaf_icon}
          className="absolute right-2 bottom-1 w-5 opacity-60 rotate-[15deg]"
        />

        {/* LOGO SECTION */}
        <Link to="/" className="flex items-center gap-4 select-none group relative z-10">
          <img
            src={logo}
            alt="GreenBasket Logo"
            className="w-[60px] h-[60px] object-contain drop-shadow-md 
            transition-transform duration-300 group-hover:scale-110"
          />

          <div className="flex flex-col leading-tight">
            <h2 className="text-3xl font-extrabold text-green-700 tracking-tight drop-shadow-sm 
            transition-all duration-300 group-hover:text-green-800">
              GreenBasket
            </h2>

            <p className="text-sm text-green-600 italic mt-1 tracking-wide 
            transition-opacity duration-300 group-hover:opacity-90">
              Real Fresh. Real Local. Real Good.
            </p>
          </div>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden sm:flex items-center gap-10 text-gray-700 font-medium">
          <Link className="hover:text-green-700 transition" to="/">Home</Link>
          <Link className="hover:text-green-700 transition" to="/products">All Products</Link>

          {/* SEARCH */}
          <div className="hidden lg:flex items-center gap-2 border border-gray-300 px-4 py-1.5 
          rounded-full bg-gray-50 shadow-sm focus-within:ring-2 focus-within:ring-green-300 transition">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none placeholder-gray-500 text-sm"
              type="text"
              placeholder="Search products..."
            />

            <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
              <path
                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"
                stroke="#6B7280"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* CART */}
          <div
            onClick={() => navigate("/cart")}
            className="relative cursor-pointer hover:scale-105 transition-transform"
          >
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path
                d="M2 2h3l2 10h9l2-7H5"
                stroke="#4A8F3B"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs w-5 h-5 
            rounded-full flex items-center justify-center shadow-md">
              {cartCount()}
            </span>
          </div>

          {/* USER */}
          {user ? (
            <div className="relative group">
              <img
                src={assets.profile_icon}
                alt=""
                className="w-10 cursor-pointer hover:scale-105 transition"
              />

              <ul className="hidden group-hover:block absolute top-12 right-0 bg-white shadow-lg 
              border border-gray-200 py-2 w-36 rounded-lg z-50 text-sm">
                <li
                  onClick={() => navigate("/my-orders")}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  My Orders
                </li>
                <li
                  className="p-2 hover:bg-gray-100 cursor-pointer text-red-600"
                  onClick={logout}
                >
                  Logout
                </li>
              </ul>
            </div>
          ) : (
            <button
              onClick={() => {
                setOpen(false);
                setShowUserLogin(true);
              }}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full 
              font-semibold shadow-sm transition-all"
            >
              Login
            </button>
          )}
        </div>

        {/* MOBILE MENU ICON */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden"
          aria-label="Menu"
        >
          <svg width="30" height="30" fill="none" stroke="#426287" strokeWidth="2">
            <path d="M4 8h22M4 15h17M4 22h13" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="flex flex-col gap-4 mt-4 sm:hidden text-gray-700 font-medium pb-3 animate-fadeIn">
          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setOpen(false)}>All Products</Link>

          {user ? (
            <>
              <button
                onClick={() => {
                  navigate("/my-orders");
                  setOpen(false);
                }}
                className="text-left"
              >
                My Orders
              </button>
              <button onClick={logout} className="text-left text-red-600">
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setOpen(false);
                setShowUserLogin(true);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-full shadow-sm w-fit transition"
            >
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

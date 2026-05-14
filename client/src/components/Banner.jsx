import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Banner = () => {
  return (
    <div className="relative">
      <img
        src={assets.main_banner_bg}
        alt=""
        className="hidden md:block w-full"
      />
      <img
        src={assets.main_banner_bg_sm}
        alt=""
        className=" md:hidden w-full"
      />
      <div className="absolute inset-0 flex flex-col items-center md:items-start justify-center pb-24 md:pb-0 md:pl-20 lg:pl-32 bg-gradient-to-r from-white/60 via-white/40 to-transparent backdrop-blur-[2px]">
        <h1
          data-aos="fade-up"
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 text-center md:text-left max-w-xl leading-tight drop-shadow-sm"
        >
          Freshness You Can Trust, <span className="text-green-700">Savings You Will Love.</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-700 max-w-md text-center md:text-left font-medium drop-shadow-sm">
           Directly from local farms to your doorstep.
        </p>
        <div className="flex items-center mt-8 font-medium gap-4">
          <Link
            to={"/products"}
            className="flex items-center gap-2 px-8 py-3.5 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30 text-white rounded-full transition-all hover:scale-105 active:scale-95"
          >
            Shop Now
          </Link>
          <Link
            to={"/deals"}
            className="hidden md:flex items-center gap-2 px-8 py-3.5 bg-white text-green-700 border border-green-200 hover:bg-green-50 shadow-sm rounded-full transition-all hover:scale-105 active:scale-95"
          >
            Explore Deals
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Banner;

import { categories } from "../assets/assets";
import { useAppContext } from "../context/appContext";
const Category = () => {
  const { navigate } = useAppContext();
  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium">Categories</p>
      <div className=" my-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 items-center justify-center">
        {categories.map((category, index) => (
          <div
            key={index}
            data-aos="zoom-in"
            className={`group cursor-pointer w-full h-52 py-5 px-3 rounded-lg gap-2 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all`}
            style={{ backgroundColor: category.bgColor }}
            onClick={() => {
              navigate(`/products/${category.path.toLowerCase()}`);
              scrollTo(0, 0);
            }}
          >
            <div className="h-32 w-full flex items-center justify-center">
              <img
                src={category.image}
                alt=""
                className="max-w-28 max-h-28 object-contain transition group-hover:scale-110"
              />
            </div>
            <p className="text-sm font-medium text-center">{category.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Category;

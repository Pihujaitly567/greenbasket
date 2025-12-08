import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/appContext";

const Products = () => {
  const { searchQuery, axios } = useAppContext();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const fetchPagedProducts = async (page, search = "", sort = "newest") => {
    try {
      setLoading(true);
      let url = `/api/product/list?page=${page}&limit=15&sort=${sort}`;
      if (search) {
        url += `&q=${encodeURIComponent(search)}`;
      }
      const { data } = await axios.get(url);
      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.totalPages);
        window.scrollTo(0, 0);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagedProducts(currentPage, searchQuery, sortBy);
  }, [currentPage, searchQuery, sortBy]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1); // Reset to first page on sort change
  };

  return (
    <div className="mt-16 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl lg:text-4xl font-medium">All Products</h1>
        <div className="flex items-center gap-2">
          <label className="text-gray-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-xl">No products found</p>
              {searchQuery && <p className="mt-2">Try a different search term</p>}
            </div>
          ) : (
            <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center justify-center">
              {products
                .filter((product) => product.inStock)
                .map((product, index) => (
                  <ProductCard key={product._id || index} product={product} />
                ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10 gap-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-md ${currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
              >
                Previous
              </button>

              <span className="text-gray-600 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-md ${currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default Products;


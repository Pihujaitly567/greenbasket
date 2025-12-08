import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/AppContext";

const Deals = () => {
    const { products } = useAppContext();
    const [discountedProducts, setDiscountedProducts] = useState([]);

    useEffect(() => {
        if (products.length > 0) {
            const deals = products.filter(
                (product) => product.offerPrice < product.price
            );
            setDiscountedProducts(deals);
        }
    }, [products]);

    return (
        <div className="mt-16">
            <h1 className="text-3xl lg:text-4xl font-medium">Exclusive Deals</h1>
            {discountedProducts.length > 0 ? (
                <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center justify-center">
                    {discountedProducts
                        .filter((product) => product.inStock)
                        .map((product, index) => (
                            <ProductCard key={index} product={product} />
                        ))}
                </div>
            ) : (
                <p className="mt-6 text-gray-500 text-lg">
                    No active deals at the moment. Check back later!
                </p>
            )}
        </div>
    );
};
export default Deals;

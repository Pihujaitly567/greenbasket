import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

import toast from "react-hot-toast";
const Cart = () => {
  const {
    products,
    navigate,
    cartCount,
    totalCartAmount,
    cartItems,
    setCartItems,
    removeFromCart,
    updateCartItem,
    axios,
    user,
    backendUrl,
  } = useAppContext();

  // state to store the products available in cart
  const [cartArray, setCartArray] = useState([]);
  // state to address
  const [address, setAddress] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  // state for selected address
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");
  const [loading, setLoading] = useState(true);

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponValid, setCouponValid] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");

  const getCart = () => {
    let tempArray = [];
    for (const key in cartItems) {
      const product = products.find((product) => product._id === key);
      product.quantity = cartItems[key];
      tempArray.push(product);
    }
    setCartArray(tempArray);
  };

  const getAddress = async () => {
    try {
      const { data } = await axios.get("/api/address/get");
      if (data.success) {
        setAddress(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    if (user) {
      getAddress();
    }
  }, [user]);

  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getCart();
      setLoading(false);
    }
  }, [products, cartItems]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true; // Make script load asynchronously
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    // 1. Load Razorpay SDK
    const res = await loadRazorpay();
    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }

    // 2. Create Order on Backend
    try {
      const { data: orderData } = await axios.post("/api/payment/create-order", {
        amount: totalCartAmount() + (totalCartAmount() * 2) / 100, // Including tax
      });

      if (!orderData.success) {
        toast.error("Error creating order");
        return;
      }

      // 3. Initialize Razorpay Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "GreenBasket",
        description: "Grocery Order Payment",
        order_id: orderData.order.id,
        handler: async function (response) {
          // 4. Verify Payment on Backend
          try {
            const { data: verifyData } = await axios.post("/api/payment/verify-payment", response);
            if (verifyData.success) {
              // 5. Place Order in DB (existing logic)
              const { data } = await axios.post("/api/order/cod", { // Renamed endpoint to be generic
                items: cartArray.map((item) => ({
                  product: item._id,
                  quantity: item.quantity,
                })),
                amount: totalCartAmount() + (totalCartAmount() * 2) / 100,
                address: selectedAddress._id,
                paymentStatus: "Paid", // Mark as paid for online orders
                paymentMethod: "Online",
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });
              if (data.success) {
                toast.success(data.message);
                setCartItems({});
                navigate("/my-orders");
              } else {
                toast.error(data.message);
              }
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            toast.error(error.message);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone || "9999999999", // Can be dynamic, use user's phone if available
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code");
      return;
    }
    try {
      const { data } = await axios.post("/api/coupon/validate", {
        code: couponCode,
        orderAmount: totalCartAmount(),
        categories: cartArray.map((item) => item.category),
      });

      if (data.success && data.valid) {
        setDiscountAmount(data.discount);
        setCouponValid(true);
        setCouponMessage(`Discount of ₹${data.discount} applied!`);
        toast.success(`Coupon applied! You save ₹${data.discount}`);
      } else {
        setCouponValid(false);
        setDiscountAmount(0);
        setCouponMessage(data.message || "Invalid coupon");
        toast.error(data.message || "Invalid coupon");
      }
    } catch (error) {
      setCouponValid(false);
      setDiscountAmount(0);
      setCouponMessage(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const placeOrder = async () => {
    try {
      if (!selectedAddress) {
        return toast.error("Please select an address");
      }

      if (paymentOption === "COD") {
        // place order with cod
        const { data } = await axios.post("/api/order/cod", {
          items: cartArray.map((item) => ({
            product: item._id,
            quantity: item.quantity,
          })),
          address: selectedAddress._id,
          paymentStatus: "Pending", // For COD, payment is pending
          paymentMethod: "COD",
          couponCode: couponValid ? couponCode : undefined,
          discountAmount: couponValid ? discountAmount : undefined,
        });
        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          navigate("/my-orders");
        } else {
          toast.error(data.message);
        }
      } else if (paymentOption === "Online") {
        await handlePlaceOrder();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row py-16 max-w-6xl w-full px-6 mx-auto gap-8">
         <div className="flex-1 animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-24 bg-gray-200 rounded w-full"></div>
            <div className="h-24 bg-gray-200 rounded w-full"></div>
         </div>
         <div className="w-[360px] animate-pulse space-y-4 bg-gray-100 p-5 rounded">
            <div className="h-6 bg-gray-300 rounded w-1/2 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-300 rounded w-full mt-6"></div>
         </div>
      </div>
    );
  }

  if (cartArray.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet.</p>
        <button
          onClick={() => navigate("/products")}
          className="px-8 py-3 bg-indigo-500 text-white rounded-full font-medium hover:bg-indigo-600 transition"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row py-16 max-w-6xl w-full px-6 mx-auto gap-8">
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 tracking-tight">
          Shopping Cart{" "}
          <span className="text-base font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{cartCount()} Items</span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-400 text-sm font-semibold uppercase tracking-wider pb-3 border-b border-gray-200">
          <p className="text-left">Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product, index) => (
          <div
            key={product._id}
            className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3"
          >
            <div className="flex items-center md:gap-6 gap-3">
              <div
                onClick={() => {
                  navigate(`product/${product.category}/${product._id}`);
                  scrollTo(0, 0);
                }}
                className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded cusror-pointer"
              >
                <img
                  className="max-w-full h-full object-contain"
                  src={`${backendUrl}/images/${product.image[0]}`}
                  alt={product.name}
                />
              </div>
              <div>
                <p className="hidden md:block font-semibold">{product.name}</p>
                <div className="font-normal text-gray-500/70">
                  <p>
                    Weight: <span>{product.weight || "N/A"}</span>
                  </p>
                  <div className="flex items-center">
                    <p>Qty:</p>
                    <select
                      onChange={(e) =>
                        updateCartItem(product._id, Number(e.target.value))
                      }
                      value={cartItems[product._id]}
                      className="outline-none"
                    >
                      {Array(
                        cartItems[product._id] > 9 ? cartItems[product._id] : 9
                      )
                        .fill("")
                        .map((_, index) => (
                          <option key={index} value={index + 1}>
                            {index + 1}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center">
              ₹{product.offerPrice * product.quantity}
            </p>
            <button
              onClick={() => removeFromCart(product._id)}
              className="cursor-pointer mx-auto"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m12.5 7.5-5 5m0-5 5 5m5.833-2.5a8.333 8.333 0 1 1-16.667 0 8.333 8.333 0 0 1 16.667 0"
                  stroke="#FF532E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ))}

        <button
          onClick={() => navigate("/products")}
          className="group cursor-pointer flex items-center mt-8 gap-2 text-green-600 font-semibold hover:text-green-700 transition-colors"
        >
          <svg
            width="15"
            height="11"
            viewBox="0 0 15 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform group-hover:-translate-x-1"
          >
            <path
              d="M14.09 5.5H1M6.143 10 1 5.5 6.143 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Continue Shopping
        </button>
      </div>
      <div className="max-w-[380px] w-full bg-white shadow-xl shadow-gray-200/50 rounded-2xl p-6 border border-gray-100 self-start sticky top-24">
        <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
        <hr className="border-gray-100 my-5" />
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Delivery Address</p>
          <div className="relative flex justify-between items-start mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <p className="text-gray-700 text-sm font-medium leading-relaxed pr-4">
              {selectedAddress
                ? `${selectedAddress.street},${selectedAddress.city},${selectedAddress.state},${selectedAddress.country}`
                : "No Address Found"}
            </p>
            <button
              onClick={() => setShowAddress(!showAddress)}
              className="text-green-600 font-semibold hover:underline cursor-pointer text-sm shrink-0"
            >
              Change
            </button>
            {showAddress && (
              <div className="absolute top-full left-0 mt-2 py-2 bg-white border border-gray-200 shadow-xl rounded-lg text-sm w-full z-10">
                {address.map((address, index) => (
                  <p
                    key={index}
                    onClick={() => {
                      setSelectedAddress(address);
                      setShowAddress(false);
                    }}
                    className="text-gray-700 p-3 hover:bg-green-50 cursor-pointer border-b border-gray-50 last:border-0"
                  >
                    {address.street}, {address.city}, {address.state},{" "}
                    {address.country}
                  </p>
                ))}
                <p
                  onClick={() => navigate("/add-address")}
                  className="text-green-600 font-semibold text-center cursor-pointer p-3 hover:bg-green-50"
                >
                  + Add new address
                </p>
              </div>
            )}
          </div>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-3">Payment Method</p>

          <select
            onChange={(e) => setPaymentOption(e.target.value)}
            className="w-full border border-gray-200 rounded-lg bg-gray-50 focus:bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 font-medium text-gray-700 transition-all"
          >
            <option value="COD">Cash On Delivery</option>
            <option value="Online">Online Payment</option>
          </select>
        </div>

        <hr className="border-gray-100" />

        <div className="text-gray-500 mt-4 space-y-2">
          <p className="flex justify-between">
            <span>Price</span>
            <span>₹{totalCartAmount()}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping Fee</span>
            <span className="text-green-600">Free</span>
          </p>
          <p className="flex justify-between">
            <span>Tax (2%)</span>
            <span>₹{Math.floor((totalCartAmount() * 2) / 100)}</span>
          </p>
          {couponValid && (
            <p className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{discountAmount}</span>
            </p>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-100">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Have a coupon?</p>
             <div className="flex gap-2">
               <input 
                 type="text" 
                 placeholder="Enter code" 
                 value={couponCode}
                 onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponValid(false);
                    setCouponMessage("");
                 }}
                 className="flex-1 border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm font-medium"
               />
               <button onClick={applyCoupon} className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-800 transition-colors active:scale-95">Apply</button>
             </div>
             {couponMessage && (
               <p className={`text-xs mt-2 font-medium ${couponValid ? 'text-green-600' : 'text-red-500'}`}>{couponMessage}</p>
             )}
          </div>

          <p className="flex justify-between text-xl font-extrabold text-gray-900 mt-4 pt-4 border-t border-gray-100">
            <span>Total Amount:</span>
            <span>₹{Math.max(0, totalCartAmount() + Math.floor((totalCartAmount() * 2) / 100) - discountAmount)}</span>
          </p>
        </div>

        <button
          onClick={placeOrder}
          className="w-full py-4 mt-6 rounded-xl cursor-pointer bg-green-600 text-white font-bold text-lg hover:bg-green-700 shadow-lg shadow-green-600/30 active:scale-[0.98] transition-all"
        >
          {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
};
export default Cart;

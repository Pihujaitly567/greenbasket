import { useContext, useEffect, useState } from "react";

import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { axios, user, backendUrl } = useAppContext();
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/user");
      if (data.success) {
        setMyOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);
  return (
    <div className="mt-12 pb-16">
      <div>
        <p className="text-2xl md:text-3xl font-medium">My Orders</p>
      </div>

      {Array.isArray(myOrders) && myOrders.map((order, index) => (
        <div
          key={index}
          className="my-8 border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl"
        >
          <p className="flex justify-between items-center gap-6 ">
            <span>orderId :{order._id} </span>
            <span>payment :{order.paymentType} </span>
            <span>Total Amount :₹{order.amount} </span>
          </p>
          {order.items?.map((item, index) => (
            <div
              key={index}
              className={`relative bg-white text-gray-800/70 ${order.items?.length !== index + 1 && "border-b"
                } border-gray-300 flex flex-col md:flex-row md:items-center  justify-between p-4 py-5 w-full max-w-4xl`}
            >
              <div className="flex items-center mb-4 md:mb-0">
                <div className="p-4 rounded-lg">
                  <img
                    src={item.product?.image?.[0] ? `${backendUrl}/images/${item.product.image[0]}` : assets.box_icon}
                    alt=""
                    className="w-16 h-16 object-contain"
                  />
                </div>

                <div className="ml-4">
                  <h2 className="text-xl font-medium">{item.product?.name || "Product Unavailable"}</h2>
                  <p>{item.product?.category || "N/A"}</p>
                </div>
              </div>

              <div className=" text-lg font-medium space-y-2">
                <p>Quantity: {item.quantity || "1"}</p>
                <div className="flex items-center gap-2">
                  <p>Status:</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs md:text-sm font-semibold 
                    ${order.status === "Delivered"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : order.status === "Order Placed"
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className=" text-lg">
                Amount:₹{(item.product?.offerPrice || 0) * item.quantity}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
export default MyOrders;

import { useContext, useEffect, useState } from "react";
import { AppContext, useAppContext } from "../../context/appContext";

import toast from "react-hot-toast";

const Orders = () => {
  const boxIcon =
    "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/e-commerce/boxIcon.svg";

  const [orders, setOrders] = useState([]);
  const { axios, backendUrl } = useAppContext();
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/seller");
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchOrders();
  }, []);

  const changeOrderStatus = async (id, status) => {
    try {
      const { data } = await axios.post("/api/order/status", {
        orderId: id,
        status,
      });
      if (data.success) {
        toast.success(data.message);
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="md:p-10 p-4 space-y-4">
      <h2 className="text-lg font-medium">Orders List</h2>
      {orders.map((order, index) => (
        <div
          key={order._id || index}
          className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center gap-5 p-5 max-w-4xl rounded-md border border-gray-300 text-gray-800"
        >
          <div className="flex gap-5">
            <img
              className="w-12 h-12 object-cover opacity-60"
              src={order.items?.[0]?.product?.image?.[0] ? `${backendUrl}/images/${order.items[0].product.image[0]}` : "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/e-commerce/boxIcon.svg"}
              alt="boxIcon"
            />
            <>
              {order.items.map((item, index) => (
                <div key={index} className="flex flex-col justify-center">
                  <p className="font-medium">
                    {item.product.name}{" "}
                    <span
                      className={`text-indigo-500 ${item.quantity < 2 && "hidden"
                        }`}
                    >
                      x {item.quantity}
                    </span>
                  </p>
                </div>
              ))}
            </>
          </div>

          <div className="text-sm">
            <p className="font-medium mb-1">
              {order.address.firstName} {order.address.lastName}
            </p>
            <p>
              {order.address.street}, {order.address.city},{" "}
              {order.address.state},{order.address.zipcode},{" "}
              {order.address.country}
            </p>
          </div>

          <p className="font-medium text-base my-auto text-black/70">
            ₹{order.amount}
          </p>

          <div className="flex flex-col text-sm gap-2">
            <p>Method: {order.paymentType}</p>
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>

            <select
              onChange={(e) => changeOrderStatus(order._id, e.target.value)}
              value={order.status}
              className="p-2 border border-gray-300 rounded outline-none"
            >
              <option value="Order Placed">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};
export default Orders;

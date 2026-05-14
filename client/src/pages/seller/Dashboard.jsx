import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { assets } from "../../assets/assets";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
const Dashboard = () => {
    const { axios, isSeller } = useAppContext();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalSales: 0,
    });
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [categoryRevenue, setCategoryRevenue] = useState([]);
    const [orderStatus, setOrderStatus] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchAnalytics = async () => {
        try {
            const { data } = await axios.get("/api/seller/analytics");
            if (data.success) {
                setStats(data.stats);
                setSalesData(data.salesData);
                setTopProducts(data.topProducts || []);
                setCategoryRevenue(data.categoryRevenue || []);
                setOrderStatus(data.orderStatusBreakdown || []);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch analytics");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (isSeller) {
            fetchAnalytics();
        }
    }, [isSeller]);
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] w-full">
                <p>Loading analytics...</p>
            </div>
        );
    }
    return (
        <div className="flex-1 px-8 py-6 bg-gray-50 min-h-screen overflow-y-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Seller Dashboard</h1>
            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                        <img src={assets.coin_icon} alt="" className="w-8 h-8 opacity-80" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Sales</p>
                        <p className="text-2xl font-semibold text-gray-800">
                            ₹{stats.totalSales.toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                        <img src={assets.order_icon} alt="" className="w-8 h-8 opacity-80" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Orders</p>
                        <p className="text-2xl font-semibold text-gray-800">
                            {stats.totalOrders}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-full">
                        <img src={assets.product_list_icon} alt="" className="w-8 h-8 opacity-80" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Products</p>
                        <p className="text-2xl font-semibold text-gray-800">
                            {stats.totalProducts}
                        </p>
                    </div>
                </div>
            </div>
            {}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Sales Overview (Last 7 Days)
                </h2>
                <div className="h-80 w-full">
                    {salesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={salesData}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="_id" tick={{ fill: "#6B7280", fontSize: 12 }} />
                                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        border: "1px solid #e5e7eb",
                                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="amount"
                                    name="Sales (₹)"
                                    fill="#6366f1"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            No sales data available for the last 7 days.
                        </div>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Status Breakdown</h2>
                    <div className="h-64 w-full">
                        {orderStatus.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={orderStatus}
                                        dataKey="count"
                                        nameKey="_id"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {orderStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">No data available.</div>
                        )}
                    </div>
                </div>
                {}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Selling Products</h2>
                    {topProducts.length > 0 ? (
                        <div className="space-y-4">
                            {topProducts.map((prod, index) => (
                                <div key={prod._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400 font-medium w-4">{index + 1}.</span>
                                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                            {prod.image && <img src={`${axios.defaults.baseURL}/images/${prod.image}`} alt={prod.name} className="w-full h-full object-cover" />}
                                        </div>
                                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{prod.name}</p>
                                    </div>
                                    <div className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                        {prod.totalSold} sold
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-48 text-gray-500">No products sold yet.</div>
                    )}
                </div>
            </div>
            {}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue by Category</h2>
                <div className="h-72 w-full">
                    {categoryRevenue.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={categoryRevenue}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 12 }} />
                                <YAxis dataKey="_id" type="category" tick={{ fill: "#6B7280", fontSize: 12 }} width={100} />
                                <Tooltip
                                    formatter={(value) => `₹${value.toLocaleString()}`}
                                    contentStyle={{ borderRadius: "8px" }}
                                />
                                <Bar dataKey="revenue" name="Revenue (₹)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">No category data available.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Dashboard;

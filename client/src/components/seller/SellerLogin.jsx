import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import React, { useState, useEffect } from "react";
const SellerLogin = () => {
  const { isSeller, setIsSeller, navigate, axios } = useAppContext();
  const [currState, setCurrState] = useState("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  useEffect(() => {
    if (isSeller) {
      navigate("/seller");
    }
  }, [isSeller]);
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (currState === "Sign Up") {
        const { data } = await axios.post("/api/seller/register", {
          name,
          email,
          password,
        });
        if (data.success) {
          setIsSeller(true);
          navigate("/seller");
          toast.success("Account created successfully");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post("/api/seller/login", {
          email,
          password,
        });
        if (data.success) {
          setIsSeller(true);
          navigate("/seller");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };
  const handleDemoLogin = async () => {
    try {
      const { data } = await axios.post("/api/seller/login", {
        email: "admin@gmail.com",
        password: "admin123",
      });
      if (data.success) {
        setIsSeller(true);
        navigate("/seller");
        toast.success("Demo Login successful");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };
  return (
    !isSeller && (
      <div className="fixed top-0 left-0 bottom-0 right-0 z-30 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm text-gray-800">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 m-auto items-start p-8 py-10 w-[90%] max-w-md rounded-2xl shadow-2xl border border-white/20 bg-white"
        >
          <div className="w-full text-center mb-2">
             <p className="text-3xl font-bold tracking-tight text-gray-900">
               <span className="text-green-600">Partner</span> {currState}
             </p>
             <p className="text-sm text-gray-500 mt-2">Manage your inventory and orders seamlessly.</p>
          </div>
            <div className="w-full">
              <p className="text-sm font-medium text-gray-700 mb-1">Company Name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Green Farms LLC"
                className="border border-gray-300 rounded-lg w-full p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                type="text"
                required
              />
            </div>
          )}
          <div className="w-full">
            <p className="text-sm font-medium text-gray-700 mb-1">Email Address</p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="admin@example.com"
              className="border border-gray-300 rounded-lg w-full p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              type="email"
              required
            />
          </div>
          <div className="w-full">
            <p className="text-sm font-medium text-gray-700 mb-1">Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="••••••••"
              className="border border-gray-300 rounded-lg w-full p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              type="password"
              required
            />
          </div>
          <button className="bg-gray-900 hover:bg-gray-800 shadow-md shadow-gray-900/20 active:scale-[0.98] transition-all text-white font-semibold w-full py-3 rounded-lg cursor-pointer mt-2">
            {currState === "Login" ? "Sign In" : "Register as Partner"}
          </button>
          {currState === "Login" && (
            <>
              <div className="w-full flex items-center gap-4 my-2 opacity-60">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="text-xs uppercase font-medium">Or</span>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="bg-white border border-gray-200 hover:bg-gray-50 shadow-sm active:scale-[0.98] transition-all text-gray-800 font-medium w-full py-3 rounded-lg cursor-pointer flex items-center justify-center gap-2"
              >
                🚀 Demo Partner Login
              </button>
            </>
          )}
          <div className="w-full text-center mt-4">
            {currState === "Login" ? (
              <p className="text-sm text-gray-600">
                New to GreenBasket?{" "}
                <span
                  onClick={() => setCurrState("Sign Up")}
                  className="text-green-600 hover:text-green-700 font-medium cursor-pointer transition-colors"
                >
                  Apply now
                </span>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Already a partner?{" "}
                <span
                  onClick={() => setCurrState("Login")}
                  className="text-green-600 hover:text-green-700 font-medium cursor-pointer transition-colors"
                >
                  Sign in
                </span>
              </p>
            )}
          </div>
        </form>
      </div>
    )
  );
};
export default SellerLogin;

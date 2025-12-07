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
      toast.error(error.message);
    }
  };
  return (
    !isSeller && (
      <div className="fixed top-0 left-0 bottom-0 right-0 z-30 flex items-center justify-center  bg-black/50 text-gray-600">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white"
        >
          <p className="text-2xl font-medium m-auto">
            <span className="text-indigo-500">Seller</span> {currState}
          </p>

          {currState === "Sign Up" && (
            <div className="w-full">
              <p>Name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="type here"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
                type="text"
                required
              />
            </div>
          )}

          <div className="w-full ">
            <p>Email</p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="type here"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
              type="email"
              required
            />
          </div>
          <div className="w-full ">
            <p>Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="type here"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
              type="password"
              required
            />
          </div>
          <button className="bg-indigo-500 hover:bg-indigo-600 transition-all text-white w-full py-2 rounded-md cursor-pointer">
            {currState === "Login" ? "Login" : "Create Account"}
          </button>

          {currState === "Login" ? (
            <p className="text-sm text-center w-full mt-2">
              No account?{" "}
              <span
                onClick={() => setCurrState("Sign Up")}
                className="text-indigo-500 cursor-pointer font-medium"
              >
                Sign up here
              </span>
            </p>
          ) : (
            <p className="text-sm text-center w-full mt-2">
              Already have an account?{" "}
              <span
                onClick={() => setCurrState("Login")}
                className="text-indigo-500 cursor-pointer font-medium"
              >
                Login here
              </span>
            </p>
          )}
        </form>
      </div>
    )
  );
};
export default SellerLogin;

import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";
const Auth = () => {
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setShowUserLogin, setUser, axios, navigate } = useAppContext();

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const { data } = await axios.post(`/api/user/${state}`, {
        name,
        email,
        password,
      });
      if (data.success) {
        toast.success(data.message);
        navigate("/");
        setUser(data.user);
        setShowUserLogin(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const handleDemoLogin = async () => {
    try {
      const demoEmail = "demo@example.com";
      const demoPassword = "demo123";
      
      const loginRes = await axios.post("/api/user/login", {
        email: demoEmail,
        password: demoPassword,
      });

      if (loginRes.data.success) {
        toast.success("Demo Login successful");
        navigate("/");
        setUser(loginRes.data.user);
        setShowUserLogin(false);
      } else {
        throw new Error(loginRes.data.message);
      }
    } catch (error) {
      // If login fails, try to register the demo account automatically
      try {
        const demoEmail = "demo@example.com";
        const demoPassword = "demo123";
        const demoName = "Demo User";

        const regRes = await axios.post("/api/user/register", {
          name: demoName,
          email: demoEmail,
          password: demoPassword,
        });

        if (regRes.data.success) {
          toast.success("Demo account created and logged in!");
          navigate("/");
          setUser(regRes.data.user);
          setShowUserLogin(false);
        } else {
          toast.error("Failed to setup demo account.");
        }
      } catch (regError) {
        toast.error("Failed to setup demo account.");
      }
    }
  };
  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed top-0 left-0 bottom-0 right-0 z-30 flex items-center justify-center  bg-black/50 text-gray-600"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-5 m-auto items-start p-8 py-10 w-[90%] max-w-md rounded-2xl shadow-2xl border border-white/20 bg-white/95 backdrop-blur-xl"
      >
        <p className="text-3xl font-bold m-auto tracking-tight">
          <span className="text-green-600">User</span>{" "}
          {state === "login" ? "Login" : "Register"}
        </p>
        {state === "register" && (
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
        <div className="w-full mt-2">
          <p className="text-sm font-medium text-gray-700 mb-1">Email Address</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="you@example.com"
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
        {state === "register" ? (
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => setState("login")}
              className="text-green-600 hover:text-green-700 font-medium cursor-pointer transition-colors"
            >
              Sign in
            </span>
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <span
              onClick={() => setState("register")}
              className="text-green-600 hover:text-green-700 font-medium cursor-pointer transition-colors"
            >
              Sign up
            </span>
          </p>
        )}
        <button className="bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20 active:scale-[0.98] transition-all text-white font-semibold w-full py-3 rounded-lg cursor-pointer mt-2">
          {state === "register" ? "Create Account" : "Sign In"}
        </button>
        {state === "login" && (
          <div className="w-full flex items-center gap-4 my-2 opacity-60">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-xs uppercase font-medium">Or</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>
        )}

        {state === "login" && (
          <button
            type="button"
            onClick={handleDemoLogin}
            className="bg-white border border-gray-200 hover:bg-gray-50 shadow-sm active:scale-[0.98] transition-all text-gray-800 font-medium w-full py-3 rounded-lg cursor-pointer flex items-center justify-center gap-2"
          >
            🚀 Demo Login
          </button>
        )}
        
        <div className="w-full text-center mt-4">
          <p className="text-sm text-gray-500">
            Are you a seller?{" "}
            <span
              onClick={() => {
                setShowUserLogin(false);
                navigate("/seller");
              }}
              className="text-green-600 hover:text-green-700 font-medium cursor-pointer transition-colors"
            >
              Seller Portal
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};
export default Auth;

import { useState, ChangeEvent, FormEvent } from "react";
import { Eye, EyeOff, ShoppingCart, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import toast, { Toaster } from "react-hot-toast";
import login_hero from "../public/login_hero.jpg";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

const LogIn: React.FC = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toastStyle = {
    borderRadius: "10px",
    background: "#ABD2F5",
    color: "#2798F5",
  };

  const signup = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.", { style: toastStyle });
      return;
    }

    try {
      const endpoint = "http://localhost:3000/user/signup"; // single endpoint

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          isSeller: isSeller,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Signup successful!", { style: toastStyle });
        setIsLogin(true);
      } else {
        toast.error(`Signup failed: ${data.message || data.error}`, {
          style: toastStyle,
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed due to network/server error.", {
        style: toastStyle,
      });
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      const endpoint = "http://localhost:3000/user/login"; // same endpoint

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        toast.success("Login successful!", { style: toastStyle });
        navigate(isSeller ? "/seller/home" : "/home");
      } else {
        toast.error(`Login failed: ${data.message}`, { style: toastStyle });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed due to network/server error.", {
        style: toastStyle,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    isLogin ? login() : signup();
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
    });
  };

  return (
    <section className="flex flex-col md:flex-row items-center overflow-hidden justify-center min-h-screen bg-white text-black">
      <Toaster position="bottom-right" reverseOrder={false} />

      {/* Left side - image */}
      <div className="hidden md:block md:w-1/2 h-screen">
        <img
          src={login_hero}
          alt="Login Hero"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Right side - form */}
      <div className="flex flex-col justify-center md:w-1/2 w-full  md:p-8">
        <div className="text-4xl font-bold text-center mb-6 text-blue-400 flex justify-center gap-4 items-center">
          <ShoppingCart size={36} />
          Shop Hub
        </div>

        {/* Seller/Buyer*/}
        <div className="flex justify-center bg-blue-200 rounded-full p-1 mb-6 w-3/4 mx-auto">
          <button
            type="button"
            onClick={() => setIsSeller(false)}
            className={`w-1/2 py-2 rounded-full font-semibold transition ${
              !isSeller ? "bg-blue-500 text-black" : "text-gray-600"
            }`}
          >
            Buyer
          </button>
          <button
            type="button"
            onClick={() => setIsSeller(true)}
            className={`w-1/2 py-2 rounded-full font-semibold transition ${
              isSeller ? "bg-blue-500 text-black" : "text-gray-600"
            }`}
          >
            Seller
          </button>
        </div>

        <h1 className="text-2xl font-semibold text-center mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-center text-gray-400 mb-5">
          {isLogin
            ? `Log in to your ${isSeller ? "Seller" : "Buyer"} account`
            : `Sign up to start as a ${isSeller ? "Seller" : "Buyer"}`}
        </p>

        <form onSubmit={handleSubmit} className="space-y-2">
          {!isLogin && (
            <>
              <div className="flex space-x-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-1/2 p-3 bg-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-1/2 p-3 bg-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full p-3 bg-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />

              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full p-3 bg-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full p-3 bg-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full p-3 bg-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          {!isLogin && (
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full p-3 bg-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}

          {isLogin && (
            <div className="text-right">
              <a
                href="#"
                className="text-sm text-blue-400 hover:text-blue-300"
                onClick={(e) => e.preventDefault()}
              >
                Forgot your password?
              </a>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-black font-semibold rounded-lg hover:bg-blue-600 transition"
          >
            {isLogin
              ? `Log In as ${isSeller ? "Seller" : "Buyer"}`
              : `Create ${isSeller ? "Seller" : "Buyer"} Account`}
          </button>
        </form>

        <p className="text-center mt-2 text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={toggleAuthMode}
            className="text-blue-400 hover:underline"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>

      {isLoading && (
        <div className="fixed inset-0 flex justify-center items-center bg-blue-400 z-50">
          <ScaleLoader
            color={"#2798F5"}
            loading={isLoading}
            height={35}
            width={5}
          />
        </div>
      )}
    </section>
  );
};

export default LogIn;

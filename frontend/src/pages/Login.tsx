import { useState, ChangeEvent, FormEvent } from "react";
import { Eye, EyeOff, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import LoginHero from "../public/login_hero.jpg";

// Updated FormData to include all potential fields
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  gstNumber?: string;
  gender: string;
  dob: string;
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
    gstNumber: "",
    gender: "",
    dob: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler for the new select dropdown
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
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

    // Basic validation for buyer-specific fields
    if (!isSeller && (!formData.gender || !formData.dob)) {
      toast.error("Gender and Date of Birth are required for buyers.", { style: toastStyle });
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = "http://localhost:3000/auth/signup"; // Assuming your server route is /auth

      // Construct the body based on user type
      const requestBody = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNum: formData.phone, // Match backend expectation
        address: { street: formData.address, city: "City", state: "State", country: "Country", pin: "12345" }, // Match backend expectation for object
        isSeller: isSeller,
        gstNo: isSeller ? formData.gstNumber : undefined,
        gender: !isSeller ? formData.gender : undefined,
        dob: !isSeller ? formData.dob : undefined,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
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
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    setIsLoading(true);
    try {
      const endpoint = "http://localhost:3000/auth/login";

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
        console.log(data.token);
        console.log("HI IM WORKGFIN");
        localStorage.setItem("user", JSON.stringify(data.userInfo));
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login();
    } else {
      await signup();
    }
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
      gender: "",
      dob: "",
      gstNumber: "",
    });
  };

  return (
    <section className="flex flex-col md:flex-row items-center overflow-hidden justify-center min-h-screen bg-white text-black">
      <Toaster position="bottom-right" reverseOrder={false} />

      {/* Left side - image */}
      <div className="hidden md:block md:w-1/2 h-screen">
        <img
          src={LoginHero}
          alt="Login Hero"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Right side - form */}
      <div className="flex flex-col justify-center md:w-1/2 w-full md:p-4">
        <div className="text-4xl font-bold text-center mb-6 text-blue-500 flex justify-center gap-4 items-center">
          <ShoppingCart size={36} />
          Shop Hub
        </div>

        {/* Seller/Buyer Toggle */}
        <div className="flex justify-center bg-blue-100 rounded-full p-1 mb-6 w-3/4 mx-auto">
          <button
            type="button"
            onClick={() => setIsSeller(false)}
            className={`w-1/2 py-2 rounded-full font-semibold transition ${!isSeller ? "bg-blue-500 text-white" : "text-gray-600"
              }`}
          >
            Buyer
          </button>
          <button
            type="button"
            onClick={() => setIsSeller(true)}
            className={`w-1/2 py-2 rounded-full font-semibold transition ${isSeller ? "bg-blue-500 text-white" : "text-gray-600"
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full md:w-1/2 p-3 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full md:w-1/2 p-3 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full p-3 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />

              <input
                type="text"
                name="address"
                placeholder="Address (Street)"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full p-3 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </>
          )}

          {/* --- DYNAMIC ROW FOR EMAIL / GENDER / GST / DOB --- */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Case 1: Buyer Signup -> Show Email + Gender + DOB */}
            {!isLogin && !isSeller && (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full md:w-1/3 p-3 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleSelectChange}
                  required
                  className="w-full md:w-1/3 p-3 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-500"
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
                <input
                  type="date"
                  name="dob"
                  placeholder="Date of Birth"
                  value={formData.dob}
                  onChange={handleInputChange}
                  required
                  className="w-full md:w-1/3 p-3 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-500"
                />
              </>
            )}

            {/* Case 2: Seller Signup -> Show Email + GST */}
            {!isLogin && isSeller && (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full md:w-1/2 p-3 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  name="gstNumber"
                  placeholder="GST Number"
                  value={formData.gstNumber || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full md:w-1/2 p-3 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </>
            )}

            {/* Case 3: Login -> Show only Email */}
            {isLogin && (
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-3 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            )}
          </div>

          {/* --- END DYNAMIC ROW --- */}

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full p-3 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3 right-3 text-gray-500 hover:text-blue-500"
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
                className="w-full p-3 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-3 right-3 text-gray-500 hover:text-blue-500"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}

          {isLogin && (
            <div className="text-right">
              <a
                href="#"
                className="text-sm text-blue-500 hover:text-blue-600"
                onClick={(e) => e.preventDefault()}
              >
                Forgot your password?
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition disabled:bg-blue-300"
          >
            {isLoading ? "Processing..." : (isLogin
              ? `Log In as ${isSeller ? "Seller" : "Buyer"}`
              : `Create ${isSeller ? "Seller" : "Buyer"} Account`)}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={toggleAuthMode}
            className="text-blue-500 hover:underline font-semibold"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>

      {isLoading && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-lg font-semibold animate-pulse">Loading...</div>
        </div>
      )}
    </section>
  );
};

export default LogIn;

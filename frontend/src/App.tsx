import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProductListings from "./pages/ProductListings";
import ProductDetails from "./pages/ProductDetails";
import ShoppingCart from "./pages/ShoppingCart";
import Checkout from "./pages/Checkout";
import OrderPlaced from "./pages/OrderPlaced";
import OrderConfirmed from "./pages/OrderConfirmed";
import UserProfile from "./pages/UserProfile";
import { CartProvider } from "./contexts/CartContext";
import LogIn from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import YourProducts from "./pages/YourProducts";
import AddProduct from "./pages/AddProduct";
import AllOrders from "./pages/AllOrders";
import Profile from "./pages/Profile";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === "/";
  const isSellerPage = location.pathname.startsWith("/seller");

  // 5. Handle navigation requests from the Dashboard/Sidebar
  const handleSellerNavigate = (page: string) => {
    // Map the simple page string to a full route path
    if (page === "dashboard") {
      navigate("/seller/home");
    } else {
      // Assumes other pages are /seller/products, /seller/add-product, etc.
      navigate(`/seller/${page}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 6. Hide main Header on login AND seller pages */}
      {!isLoginPage && !isSellerPage && <Header />}
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<LogIn />} />

          {/* Buyer Routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/products" element={<ProductListings />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-placed" element={<OrderPlaced />} />
          <Route path="/order-confirmed" element={<OrderConfirmed />} />
          <Route path="/profile" element={<UserProfile />} />

          {/* Seller Routes */}
          <Route
            path="/seller/home"
            element={<Dashboard onNavigate={handleSellerNavigate} />}
          />
          <Route
            path="/seller/products"
            element={<YourProducts onNavigate={handleSellerNavigate} />}
          />
          <Route
            path="/seller/add-product"
            element={<AddProduct onNavigate={handleSellerNavigate} />}
          />
          <Route
            path="/seller/all-orders"
            element={<AllOrders onNavigate={handleSellerNavigate} />}
          />
          <Route
            path="/seller/profile"
            element={<Profile onNavigate={handleSellerNavigate} />}
          />
        </Routes>
      </main>
      {/* 8. Hide main Footer on login AND seller pages */}
      {!isLoginPage && !isSellerPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
}

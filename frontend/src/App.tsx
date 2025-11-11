import {
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProductListings from "./pages/ProductListings";
import ProductDetails from "./pages/ProductDetails";
import ShoppingCart from "./pages/ShoppingCart";
import Checkout from "./pages/Checkout";
import OrderConfirmed from "./pages/OrderConfirmed";
import OrderFailed from "./pages/OrderFailed";
import UserProfile from "./pages/UserProfile";
import { CartProvider } from "./contexts/CartContext";
import LogIn from "./pages/Login"; 
import Dashboard from "./pages/Dashboard";
import YourProducts from "./pages/YourProducts";
import AddProduct from "./pages/AddProduct";
import AllOrders from "./pages/AllOrders";
import Profile from "./pages/Profile";
import { AuthProvider } from "./contexts/AuthContext"; 
import TransactionSuccess from "./pages/TransactionSuccessful";
import TransactionFailed from "./pages/TransactionFailed";
import { AddReviewPage } from "./pages/AddReview";
import OrderPlaced from "./pages/OrderPlaced";
import UserOrders from "./pages/UserOrders";


function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const [editProductId, setEditProductId] = useState<string | undefined>(undefined);

  const isLoginPage = location.pathname === "/";
  const isSellerPage = location.pathname.startsWith("/seller");
  const isTransactionSuccessful = location.pathname === "/payment-confirmed";
  const isTransactionFailed = location.pathname === "/payment-failed";
  const isOrderConfirmed = location.pathname === "/order-confirmed";

  const handleSellerNavigate = (page: string, productId?: string) => {
    // Check if we are going to the add/edit page
    if (page === 'add-product') {
      // If an ID is provided (Edit), store it in state.
      // If no ID is provided (Add), this sets it to undefined, which is correct.
      setEditProductId(productId); 
      navigate('/seller/add-product');
    } else if (page === "dashboard") {
      setEditProductId(undefined);
      navigate("/seller/home");
    } else {
      setEditProductId(undefined);
      navigate(`/seller/${page}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoginPage && !isTransactionSuccessful && !isTransactionFailed && !isSellerPage && !isOrderConfirmed && <Header />}
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<LogIn />} />

          <Route path="/home" element={<HomePage />} />
          <Route path="/products" element={<ProductListings />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-confirmed" element={<TransactionSuccess />} />
          <Route path="/payment-failed" element={<TransactionFailed />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/review-page" element={<AddReviewPage />} />
          {/* <Route path="/order-placed" element={<OrderPlaced />} /> */}
          <Route path="/order-confirmed" element={<OrderConfirmed />} />

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
            element={
              <AddProduct 
                onNavigate={handleSellerNavigate} 
                productId={editProductId} 
              />
            }
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
      {!isLoginPage && !isTransactionSuccessful && !isTransactionFailed && !isSellerPage && !isOrderConfirmed && <Footer />}
    </div>
  );
}

export default function App() {
  return (
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
  );
}
 

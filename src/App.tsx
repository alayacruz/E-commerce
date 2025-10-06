import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AllOrders from './pages/AllOrders';
import YourProducts from './pages/YourProducts';
import AddProduct from './pages/AddProduct';
import SellerProfile from './pages/SellerProfile';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<AllOrders />} />
          <Route path="/products" element={<YourProducts />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/profile" element={<SellerProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
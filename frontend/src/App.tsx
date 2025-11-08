import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Layout from "./common/Layout";
import CategoryForm from "./pages/Categories/CategoryForm";
import Categories from "./pages/Categories/Categories";
import Sliders from "./pages/Sliders/Sliders";
import SliderForm from "./pages/Sliders/SliderForm";
import Products from "./pages/Products/Products";
import ProductForm from "./pages/Products/ProductForm";
import Users from "./pages/Users/Users";
import Brands from "./pages/Brands/Brands";
import BrandForm from "./pages/Brands/BrandForm";
import Requests from "./pages/Requests/Requests";
import Orders from "./pages/Orders/Orders";
import OrderDetail from "./pages/Orders/OrderDetail";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/*" element={<Layout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="sliders" element={<Sliders />} />
          <Route path="sliders/create" element={<SliderForm />} />
          <Route path="sliders/edit/:id" element={<SliderForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="categories/create" element={<CategoryForm />} />
          <Route path="categories/edit/:id" element={<CategoryForm />} />
          <Route path="products" element={<Products />} />
          <Route path="products/create" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="brands" element={<Brands />} />
          <Route path="brands/create" element={<BrandForm />} />
          <Route path="brands/edit/:id" element={<BrandForm />} />
          <Route path="requests" element={<Requests />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

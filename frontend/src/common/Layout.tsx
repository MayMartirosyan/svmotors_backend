import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";


const Layout: React.FC = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/admin/login";
    return null;
  }

  return (
    <div className="flex bg-[#F9FAFB] text-[#1E293B] min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import Input from "../uikit/Input";
import Button from "../uikit/Button";
import { BASE_URL } from "../utils";

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/login`,
        credentials
      );
      localStorage.setItem("token", response.data.token);
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 3000,
      });
      window.location.href = "/admin/dashboard";
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center text-[#1E293B]">
      <form
        onSubmit={handleSubmit}
        className="bg-[#FFFFFF] p-6 rounded-lg shadow-lg w-full max-w-md border border-[#E5E7EB]"
      >
        <h2 className="text-2xl font-serif text-[#1E293B] mb-4 text-center">
          VS Motors Админ Панель
        </h2>

        <div className="mt-2">
          <Input
            label="Username"
            type="text"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mt-2">
          <Input
            label="Password"
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" className="mt-4">
          Вход
        </Button>
      </form>
    </div>
  );
};

export default Login;

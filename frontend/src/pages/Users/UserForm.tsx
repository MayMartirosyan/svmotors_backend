import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils";
import Input from "../../uikit/Input";
import Button from "../../uikit/Button";

interface FormValues {
  name: string;
  surname: string;
  password: string;
}

const UserForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      surname: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/users/user`, data);
      toast.success("User created successfully");
      navigate("/admin/users");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow rounded">
      <h1 className="text-2xl mb-4 text-[#1E293B] font-serif">Create User</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            {...register("name", { required: "Name is required" })}
            disabled={isLoading}
            error={errors.name?.message}
          />
          <Input
            label="Surname"
            {...register("surname", { required: "Surname is required" })}
            disabled={isLoading}
            error={errors.surname?.message}
          />
          <Input
            label="Password"
            type="password"
            {...register("password", { required: "Password is required" })}
            disabled={isLoading}
            error={errors.password?.message}
          />
          <Button type="submit" disabled={isLoading}>
            Save User
          </Button>
        </form>
      )}
    </div>
  );
};

export default UserForm;

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils";
import Input from "../../uikit/Input";
import ImageUpload from "../../components/ImageUpload";
import Button from "../../uikit/Button";

interface FormValues {
  name: string;
}

const schema = yup.object().shape({
  name: yup.string().required("Название обязательно"),
});

const BrandForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema as any),
    defaultValues: {
      name: "",
    },
  });

  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const response = await axios.get(
            `${BASE_URL}/api/brands/brand/${id}`
          );
          const brand = response.data;
          setValue("name", brand.name);
          if (brand.brandImage) {
            setInitialImageUrl(`${brand.brandImage}`);
          }
        }
      } catch (error) {
        console.error("Не удалось загрузить данные:", error);
        toast.error(id ? "Не удалось загрузить бренд" : "Ошибка загрузки");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, setValue]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);

      if (imageFile) {
        formData.append("brandImage", imageFile);
      } else if (!id && !imageFile) {
        formData.append("brandImage", "");
      } else if (id && initialImageUrl) {
        formData.append("brandImage", initialImageUrl);
      }

      const isUpdate = Boolean(id);
      const method = isUpdate ? "put" : "post";
      const url = isUpdate
        ? `${BASE_URL}/api/brands/brand/${id}`
        : `${BASE_URL}/api/brands/brand`;

      const response = await axios[method](url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`Бренд ${isUpdate ? "обновлен" : "создан"} успешно`);
      navigate("/admin/brands");
    } catch (error) {
      console.error(error);
      toast.error(
        id ? "Не удалось обновить бренд" : "Не удалось создать бренд"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow rounded">
      <h1 className="text-2xl mb-4 text-[#1E293B] font-serif">
        {id ? "Редактировать бренд" : "Создать бренд"}
      </h1>
      {isLoading ? (
        <p>Загрузка...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Название"
            {...register("name")}
            disabled={isLoading}
            error={errors.name?.message}
          />
          <ImageUpload
            onImageChange={setImageFile}
            initialPreview={initialImageUrl}
          />
          <Button type="submit" disabled={isLoading}>
            {id ? "Обновить бренд" : "Сохранить бренд"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default BrandForm;

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
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema as any),
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  // ✅ объект brandImage (original/medium/etc)
  const [initialImageObject, setInitialImageObject] = useState<any | null>(null);

  // ✅ превью для ImageUpload
  const [initialPreview, setInitialPreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadBrand = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const res = await axios.get(`${BASE_URL}/api/brands/brand/${id}`);
          const brand = res.data;

          setValue("name", brand.name);

          if (brand.brandImage) {
            setInitialImageObject(brand.brandImage);
            setInitialPreview(
              brand.brandImage.medium || brand.brandImage.original
            );
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Ошибка загрузки бренда");
      } finally {
        setIsLoading(false);
      }
    };

    loadBrand();
  }, [id, setValue]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);

      // ✅ ЛОГИКА:
      if (imageFile) {
        formData.append("brandImage", imageFile);
      } else if (initialImageObject) {
        formData.append("brandImage", JSON.stringify(initialImageObject));
      } else {
        formData.append("brandImage", "");
      }

      const isUpdate = Boolean(id);
      const method = isUpdate ? "put" : "post";
      const url = isUpdate
        ? `${BASE_URL}/api/brands/brand/${id}`
        : `${BASE_URL}/api/brands/brand`;

      await axios[method](url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(isUpdate ? "Бренд обновлен" : "Бренд создан");
      navigate("/admin/brands");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка сохранения");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow rounded">
      <h1 className="text-2xl font-serif text-[#1E293B] mb-4">
        {id ? "Редактировать бренд" : "Создать бренд"}
      </h1>

      {isLoading ? (
        <p>Загрузка...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Название"
            {...register("name")}
            error={errors.name?.message}
          />

          <ImageUpload
            label="Логотип"
            onImageChange={setImageFile}
            initialPreview={initialPreview}
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

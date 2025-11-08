import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils";
import Input from "../../uikit/Input";
import ImageUpload from "../../components/ImageUpload";
import Button from "../../uikit/Button";

interface FormValues {
  sliderTitle: string;
  sliderDesc: string;
  sliderLink: string;
}

const SliderForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      sliderTitle: "",
      sliderDesc: "",
      sliderLink: "",
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
          const sliderResponse = await axios.get(
            `${BASE_URL}/api/sliders/slider/${id}`
          );
          const slider = sliderResponse.data;
          setValue("sliderTitle", slider.sliderTitle);
          setValue("sliderDesc", slider.sliderDesc || "");
          setValue("sliderLink", slider.sliderLink);
          if (slider.sliderImage) {
            setInitialImageUrl(`${BASE_URL}${slider.sliderImage}`);
          }
        }
      } catch (error) {
        console.error("Не удалось загружать слайдеры:", error);
        toast.error("Не удалось загружать слайдеры");
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
      formData.append("sliderTitle", data.sliderTitle);
      formData.append("sliderDesc", data.sliderDesc);
      formData.append("sliderLink", data.sliderLink);
      if (imageFile) {
        formData.append("sliderImage", imageFile);
      } else if (!id && !imageFile) {
        formData.append("sliderImage", ""); 
      } else if (id && initialImageUrl) {
        formData.append(
          "sliderImage",
          initialImageUrl.replace(`${BASE_URL}`, "")
        );
      }

      const isUpdate = Boolean(id);
      const method = isUpdate ? "put" : "post";
      const url = isUpdate
        ? `${BASE_URL}/api/sliders/slider/${id}`
        : `${BASE_URL}/api/sliders/slider`;

      const response = await axios[method](url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`Слайдер ${isUpdate ? "Обновлено" : "Сохранено"}`);
      navigate("/admin/sliders");
    } catch (error) {
      console.error(error);
      toast.error(id ? "Не удалось сохранить слайдер" : 'Не удалось создать слайдер');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow rounded">
      <h1 className="text-2xl mb-4 text-[#1E293B] font-serif">
        {id ? "Создать Слайдер" : "Сохранить Слайдер"}
      </h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Заголовок"
            {...register("sliderTitle", { required: "Заголовок обязателен" })}
            disabled={isLoading}
            error={errors.sliderTitle?.message}
          />
          <ImageUpload
            onImageChange={setImageFile}
            initialPreview={initialImageUrl}
          />
          <Input
            label="Контент"
            {...register("sliderDesc")}
            disabled={isLoading}
            error={errors.sliderDesc?.message}
          />
          <Input
            label="Ссылка"
            type="text"
            {...register("sliderLink")}
            disabled={isLoading}
            error={errors.sliderLink?.message}
          />
          <Button type="submit" disabled={isLoading}>
            {id ? "Обновить" : "Сохранить"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default SliderForm;

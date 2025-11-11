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
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      sliderTitle: "",
      sliderDesc: "",
      sliderLink: "",
    },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [initialImageObject, setInitialImageObject] = useState<any | null>(null);
  const [initialPreview, setInitialPreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSlider = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const res = await axios.get(`${BASE_URL}/api/sliders/slider/${id}`);
          const slider = res.data;

          setValue("sliderTitle", slider.sliderTitle);
          setValue("sliderDesc", slider.sliderDesc || "");
          setValue("sliderLink", slider.sliderLink);

          if (slider.sliderImage) {
            const img = slider.sliderImage;

            setInitialImageObject(img);

            setInitialPreview(
              img.medium ||
                img.original ||
                img.large ||
                img.small ||
                img.thumb ||
                null
            );
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Ошибка загрузки слайдера");
      } finally {
        setIsLoading(false);
      }
    };

    loadSlider();
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
      } else if (initialImageObject) {
        formData.append("sliderImage", JSON.stringify(initialImageObject));
      } else {
        formData.append("sliderImage", "");
      }

      const method = id ? "put" : "post";
      const url = id
        ? `${BASE_URL}/api/sliders/slider/${id}`
        : `${BASE_URL}/api/sliders/slider`;

      await axios[method](url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(id ? "Слайдер обновлён" : "Слайдер создан");
      navigate("/admin/sliders");
    } catch (error) {
      console.error(error);
      toast.error("Ошибка сохранения");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow rounded">
      <h1 className="text-2xl mb-4 text-[#1E293B] font-serif">
        {id ? "Редактировать слайдер" : "Создать слайдер"}
      </h1>

      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Заголовок"
            {...register("sliderTitle", { required: "Заголовок обязателен" })}
            error={errors.sliderTitle?.message}
          />

          <ImageUpload
            label="Картинка слайдера"
            onImageChange={setImageFile}
            initialPreview={initialPreview}
          />

          <Input
            label="Описание"
            {...register("sliderDesc")}
            error={errors.sliderDesc?.message}
          />

          <Input
            label="Ссылка"
            {...register("sliderLink")}
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

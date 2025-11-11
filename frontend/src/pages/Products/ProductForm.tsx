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
import Select from "../../uikit/Select";
import Checkbox from "../../uikit/Checkbox";
import Textarea from "../../uikit/TextArea";

interface FormValues {
  name: string;
  shortDescription: string;
  description: string;
  price: number | null;
  discountedPrice: number | null;
  isNew: boolean;
  isRecommended: boolean;
  categoryId: number;
  sku: string;
  article: string;
}

const schema = yup.object().shape({
  name: yup.string().required("Название обязательно"),
  shortDescription: yup.string().max(255).nullable(),
  description: yup.string().required("Описание обязательно"),

  price: yup
    .number()
    .typeError("Цена должна быть числом")
    .positive("Цена должна быть больше 0")
    .required("Цена обязательна"),

  discountedPrice: yup
    .number()
    .typeError("Скидочная цена должна быть числом")
    .positive("Скидочная цена должна быть больше 0")
    .nullable()
    .transform((value, orig) => (orig === "" ? null : value))
    .test(
      "is-less-than-price",
      "Скидочная цена должна быть меньше обычной",
      function (value) {
        const { price } = this.parent;
        if (!value) return true;
        return value < price;
      }
    ),

  isNew: yup.boolean(),
  isRecommended: yup.boolean(),
  categoryId: yup.number().required("Категория обязательна"),
  sku: yup.string().max(50).nullable(),
  article: yup.string().max(50).nullable(),
});
const ProductForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema as any),
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  // ✅ Храним весь объект productImage (original/large/medium/... )
  const [initialImageObject, setInitialImageObject] = useState<any | null>(
    null
  );

  // ✅ Только превью для ImageUpload
  const [initialPreview, setInitialPreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  // ——————————————————————————————————————
  // Функция разворачивания категорий
  // ——————————————————————————————————————
  const flattenCategories = (categories: any[], depth = 0) => {
    return categories.reduce((acc: any[], cat: any) => {
      acc.push({ id: cat.id, name: `${"— ".repeat(depth)}${cat.name}` });
      if (cat.children?.length) {
        acc.push(...flattenCategories(cat.children, depth + 1));
      }
      return acc;
    }, []);
  };

  // ——————————————————————————————————————
  // Загрузка продукта + категорий
  // ——————————————————————————————————————
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/categories`),
          id
            ? axios.get(`${BASE_URL}/api/products/product/${id}`)
            : Promise.resolve(null),
        ]);

        setCategories(flattenCategories(catRes.data));

        if (id && prodRes) {
          const product = prodRes.data;

          setValue("name", product.name);
          setValue("shortDescription", product.shortDescription ?? "");
          setValue("description", product.description ?? "");
          setValue("price", product.price);
          setValue("discountedPrice", product.discountedPrice ?? null);
          setValue("isNew", product.isNew);
          setValue("isRecommended", product.isRecommended);
          setValue("categoryId", product.category?.id || product.categoryId);
          setValue("sku", product.sku ?? "");
          setValue("article", product.article ?? "");

          if (product.productImage) {
            setInitialImageObject(product.productImage);
            setInitialPreview(
              product.productImage.medium || product.productImage.original
            );
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Ошибка загрузки данных");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, setValue]);

  // ——————————————————————————————————————
  // ОТПРАВКА ФОРМЫ
  // ——————————————————————————————————————
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("shortDescription", data.shortDescription ?? "");
      formData.append("description", data.description);
      formData.append("price", String(data.price));
      formData.append("sku", data.sku);
      formData.append("article", data.article);

      if (data.discountedPrice !== null)
        formData.append("discountedPrice", String(data.discountedPrice));

      formData.append("isNew", String(data.isNew));
      formData.append("isRecommended", String(data.isRecommended));
      formData.append("categoryId", String(data.categoryId));

      if (imageFile) {
        formData.append("productImage", imageFile);
      } else if (initialImageObject) {
        formData.append("productImage", JSON.stringify(initialImageObject));
      } else {
        formData.append("productImage", "");
      }

      const isUpdate = Boolean(id);
      const method = isUpdate ? "put" : "post";

      const url = isUpdate
        ? `${BASE_URL}/api/products/product/${id}`
        : `${BASE_URL}/api/products/product`;

      await axios[method](url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(isUpdate ? "Продукт обновлен" : "Продукт создан");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка сохранения продукта");
    } finally {
      setIsLoading(false);
    }
  };

  // ——————————————————————————————————————
  // UI
  // ——————————————————————————————————————
  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow rounded">
      <h1 className="text-2xl mb-4 text-[#1E293B] font-serif">
        {id ? "Редактировать продукт" : "Создать продукт"}
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
          <Input
            label="Код Продукта"
            {...register("sku")}
            error={errors.sku?.message}
          />
          <Input
            label="Артикул"
            {...register("article")}
            error={errors.article?.message}
          />
          <Textarea
            label="Краткое описание"
            rows={4}
            {...register("shortDescription")}
            error={errors.shortDescription?.message}
          />

          <Textarea
            label="Описание"
            rows={8}
            {...register("description")}
            error={errors.description?.message}
          />

          <ImageUpload
            label="Изображение"
            onImageChange={setImageFile}
            initialPreview={initialPreview}
          />

          <Input
            label="Цена"
            type="number"
            {...register("price")}
            error={errors.price?.message}
          />
          <Input
            label="Скидочная цена"
            type="number"
            {...register("discountedPrice")}
            error={errors.discountedPrice?.message}
          />

          <Checkbox
            label="Новинка"
            {...register("isNew")}
            checked={watch("isNew")}
            onChange={(e) => setValue("isNew", e.target.checked)}
          />

          <Checkbox
            label="Рекомендуемый"
            {...register("isRecommended")}
            checked={watch("isRecommended")}
            onChange={(e) => setValue("isRecommended", e.target.checked)}
          />

          <Select
            label="Категория"
            options={categories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            }))}
            {...register("categoryId")}
            error={errors.categoryId?.message}
          />

          <Button type="submit">
            {id ? "Обновить продукт" : "Создать продукт"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ProductForm;

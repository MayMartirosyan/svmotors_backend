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
  shortDescription: yup.string().max(255, "Краткое описание не должно превышать 255 символов").nullable(),
  description: yup.string().required("Описание обязательно"),
  price: yup
    .number()
    .typeError("Цена должна быть числом")
    .positive("Цена должна быть больше 0")
    .required("Цена обязательна"),
  discountedPrice: yup
    .number()
    .positive("Скидочная цена должна быть больше 0")
    .nullable(),
  isNew: yup.boolean(),
  isRecommended: yup.boolean(),
  categoryId: yup.number().required("Категория обязательна"),
  sku: yup.string().max(50, "SKU не должно превышать 50 символов").nullable(),
  article: yup.string().max(50, "Артикул не должно превышать 50 символов").nullable(),
});

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema as any),
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      price: null,
      discountedPrice: null,
      isNew: false,
      isRecommended: false,
      categoryId: undefined as unknown as number,
      sku: "",
      article: "",
    },
  });

  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Рекурсивно собираем все категории с отступами
  const flattenCategories = (
    categories: any[],
    depth = 0
  ): { id: number; name: string }[] => {
    return categories.reduce((acc: any[], cat: any) => {
      acc.push({
        id: cat.id,
        name: `${'— '.repeat(depth)}${cat.name}`,
      });
      if (cat.children && cat.children.length > 0) {
        acc.push(...flattenCategories(cat.children, depth + 1));
      }
      return acc;
    }, []);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesResponse, productResponse] = await Promise.all([
          axios.get(`${BASE_URL}/api/categories`),
          id ? axios.get(`${BASE_URL}/api/products/product/${id}`) : Promise.resolve(null),
        ]);

        // Плоский список всех категорий
        setCategories(flattenCategories(categoriesResponse.data));

        if (id && productResponse) {
          const product = productResponse.data;
          setValue("name", product.name);
          setValue("shortDescription", product.shortDescription || "");
          setValue("description", product.description || "");
          setValue("price", product.price);
          setValue("discountedPrice", product.discountedPrice || null);
          setValue("isNew", product.isNew);
          setValue("isRecommended", product.isRecommended);
          setValue("categoryId", product.category?.id || product.categoryId);
          setValue("sku", product.sku || "");
          setValue("article", product.article || "");
          if (product.productImage) {
            setInitialImageUrl(`${BASE_URL}${product.productImage}`);
          }
        }
      } catch (error) {
        console.error("Не удалось загрузить данные:", error);
        toast.error(id ? "Не удалось загрузить продукт" : "Не удалось загрузить категории");
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
      formData.append("shortDescription", data.shortDescription || "");
      formData.append("description", data.description);
      formData.append("price", String(data.price));
      formData.append("sku", data.sku);
      formData.append("article", data.article);
      if (data.discountedPrice !== null) {
        formData.append("discountedPrice", String(data.discountedPrice));
      }
      formData.append("isNew", String(data.isNew));
      formData.append("isRecommended", String(data.isRecommended));
      formData.append("categoryId", String(data.categoryId));

      if (imageFile) {
        formData.append("productImage", imageFile);
      } else if (!id && !imageFile) {
        formData.append("productImage", "");
      } else if (id && initialImageUrl) {
        formData.append("productImage", initialImageUrl);
      }

      const isUpdate = Boolean(id);
      const method = isUpdate ? "put" : "post";
      const url = isUpdate
        ? `${BASE_URL}/api/products/product/${id}`
        : `${BASE_URL}/api/products/product`;

      const response = await axios[method](url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`Продукт ${isUpdate ? "обновлен" : "создан"} успешно`);
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error(id ? "Не удалось обновить продукт" : "Не удалось создать продукт");
    } finally {
      setIsLoading(false);
    }
  };

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
            disabled={isLoading}
            error={errors.name?.message}
          />
          <Input
            label="Код Продукта"
            {...register("sku")}
            disabled={isLoading}
            error={errors.sku?.message}
          />
          <Input
            label="Артикул"
            {...register("article")}
            disabled={isLoading}
            error={errors.article?.message}
          />
          <Input
            label="Краткое описание"
            {...register("shortDescription")}
            disabled={isLoading}
            error={errors.shortDescription?.message}
          />
          <Input
            label="Описание"
            {...register("description")}
            disabled={isLoading}
            error={errors.description?.message}
          />
          <ImageUpload
            onImageChange={setImageFile}
            initialPreview={initialImageUrl}
          />
          <Input
            label="Цена"
            type="number"
            {...register("price")}
            disabled={isLoading}
            error={errors.price?.message}
          />
          <Input
            label="Скидочная цена"
            type="number"
            {...register("discountedPrice")}
            disabled={isLoading}
            error={errors.discountedPrice?.message}
          />
          <Checkbox
            label="Новинка"
            {...register("isNew")}
            checked={watch("isNew")}
            onChange={(e) => setValue("isNew", e.target.checked)}
            disabled={isLoading}
            error={errors.isNew?.message}
          />
          <Checkbox
            label="Рекомендуемый"
            {...register("isRecommended")}
            checked={watch("isRecommended")}
            onChange={(e) => setValue("isRecommended", e.target.checked)}
            disabled={isLoading}
            error={errors.isRecommended?.message}
          />
          
          {/* ВСЕ КАТЕГОРИИ (включая дочерние) */}
          <Select
            label="Категория"
            options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
            {...register("categoryId")}
            disabled={isLoading}
            error={errors.categoryId?.message}
          />

          <Button type="submit" disabled={isLoading}>
            {id ? "Обновить продукт" : "Сохранить продукт"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ProductForm;
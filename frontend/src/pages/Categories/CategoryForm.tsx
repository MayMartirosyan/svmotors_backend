import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils";

import Input from "../../uikit/Input";
import ImageUpload from "../../components/ImageUpload";
import Button from "../../uikit/Button";
import Select from "../../uikit/Select";

interface FormValues {
  name: string;
  parentId?: number | null;
}

const CategoryForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: { name: "", parentId: null },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [initialImageObject, setInitialImageObject] = useState<any | null>(null);
  const [initialPreview, setInitialPreview] = useState<string | null>(null);

  const [parentOptions, setParentOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: treeCategories } = await axios.get(`${BASE_URL}/api/categories`);

      let currentCategory: any = null;
      const excludedIds = new Set<number>();

      if (id) {
        const { data } = await axios.get(`${BASE_URL}/api/categories/category/${id}`);
        currentCategory = data;

        setValue("name", data.name);
        setValue("parentId", data.parent?.id || null);

        if (data.categoryImage) {
          const img = data.categoryImage;
          setInitialImageObject(img);
          setInitialPreview(img.medium || img.original || img.large || img.small || img.thumb || null);
        }

        collectDescendantIds(data, excludedIds);
      }


      const options = buildParentOptions(treeCategories, excludedIds, currentCategory?.id);
      setParentOptions(options);

    } catch (err) {
      console.error(err);
      toast.error("Ошибка загрузки категорий");
    } finally {
      setIsLoading(false);
    }
  };


  const collectDescendantIds = (category: any, excludedIds: Set<number>) => {
    excludedIds.add(category.id);
    if (category.children?.length) {
      category.children.forEach((child: any) => {
        collectDescendantIds(child, excludedIds);
      });
    }
  };


  const buildParentOptions = (categories: any[], excludedIds: Set<number>, currentId?: number) => {
    const options: any[] = [{ value: "", label: "Без родителя (корневая категория)" }];

    const traverse = (cats: any[], depth: number = 0) => {
      cats.forEach((cat) => {
        if (cat.id === currentId) return; 

        const isExcluded = excludedIds.has(cat.id);
        
        options.push({
          value: cat.id.toString(),
          label: "   ".repeat(depth) + "↳ " + cat.name,
          disabled: isExcluded,
        });

        if (cat.children?.length) {
          traverse(cat.children, depth + 1);
        }
      });
    };

    traverse(categories);
    return options;
  };

  const onSubmit = async (form: FormValues) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);

      if (form.parentId !== null && form.parentId !== undefined) {
        formData.append("parentId", form.parentId.toString());
      }

      if (imageFile) {
        formData.append("category_image", imageFile);
      } else if (initialImageObject) {
        formData.append("category_image", JSON.stringify(initialImageObject));
      }

      const method = id ? "put" : "post";
      const endpoint = id
        ? `${BASE_URL}/api/categories/category/${id}`
        : `${BASE_URL}/api/categories/category/`;

      await axios[method](endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`Категория успешно ${id ? "обновлена" : "создана"}`);
      navigate("/admin/categories");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || `Не удалось ${id ? "обновить" : "создать"} категорию`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow rounded">
      <h1 className="text-2xl font-serif text-[#1E293B] mb-4">
        {id ? "Обновить категорию" : "Создать категорию"}
      </h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Название"
            {...register("name", { required: "Введите название" })}
          />

          <Select
            label="Родительская категория"
            options={parentOptions}
            value={watch("parentId")?.toString() || ""}
            onChange={(e) => {
              const val = e.target.value;
              setValue("parentId", val ? parseInt(val) : null);
            }}
          />

          <ImageUpload
            label="Картинка категории"
            onImageChange={setImageFile}
            initialPreview={initialPreview}
          />

          <Button type="submit" disabled={isLoading}>
            {id ? "Обновить" : "Сохранить"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default CategoryForm;
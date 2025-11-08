import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils";
import Input from "../../uikit/Input";
import ImageUpload from "../../components/ImageUpload";
import Button from "../../uikit/Button";
import Select from "../../uikit/Select"; // Предполагаем, что у тебя есть компонент Select

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
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCategory = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const { data } = await axios.get(`${BASE_URL}/api/categories/category/${id}`);
        setValue("name", data.name);
        setValue("parentId", data.parent?.id || null);
        if (data.categoryImage) {
          setInitialImageUrl(`${BASE_URL}${data.categoryImage}`);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load category");
      } finally {
        setIsLoading(false);
      }
    };

    const loadParentCategories = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/categories`);
        // Фильтруем, чтобы не показывать текущую категорию как родителя
        const filteredCategories = data.filter((cat: any) => cat.id !== parseInt(id || "0"));
        setParentCategories(filteredCategories);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load parent categories");
      }
    };

    loadCategory();
    loadParentCategories();
  }, [id, setValue]);

  const onSubmit = async (form: FormValues) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.parentId) {
        formData.append("parentId", form.parentId.toString());
      }
      if (imageFile) {
        formData.append("category_image", imageFile);
      } else if (!id && !imageFile) {
        formData.append("category_image", "");
      } else if (id && initialImageUrl) {
        formData.append("category_image", initialImageUrl);
      }

      const method = id ? "put" : "post";
      const endpoint = id
        ? `${BASE_URL}/api/categories/category/${id}`
        : `${BASE_URL}/api/categories/category`;

      await axios[method](endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`Category ${id ? "updated" : "created"} successfully`);
      navigate("/admin/categories");
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${id ? "update" : "create"} category`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow rounded">
      <h1 className="text-2xl font-serif text-[#1E293B] mb-4">
        {id ? "Edit Category" : "Create Category"}
      </h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            {...register("name", { required: "Name is required" })}
            disabled={isLoading}
          />

          <Select
            label="Родительская котегория"
            {...register("parentId")}
            options={parentCategories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            }))}
            value={watch("parentId")?.toString() || ""}
            onChange={(e) => setValue("parentId", e.target.value ? parseInt(e.target.value) : null)}
            // label="Select parent category"
          />

          <ImageUpload
            onImageChange={setImageFile}
            initialPreview={initialImageUrl}
          />

          <Button type="submit" disabled={isLoading}>
            {id ? "Update Category" : "Save Category"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default CategoryForm;
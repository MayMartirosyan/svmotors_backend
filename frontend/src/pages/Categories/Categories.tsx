import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils";
import Button from "../../uikit/Button";
import { Table, TableCell, TableRow } from "../../uikit/Table";

// Определяем интерфейс для категории с учетом детей
interface Category {
  id: number;
  name: string;
  categoryImage?: string | null;
  children?: Category[];
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/categories`);
      setCategories(response.data); // Ожидаем, что API вернет дерево
    } catch (error) {
      toast.error("Failed to fetch categories");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/categories/category/${id}`);
      toast.success("Category deleted");
      fetchCategories(); 
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };
  const renderCategories = (categories: Category[], depth = 0) => {
    return categories.map((category) => (
      <React.Fragment key={category.id}>
        <TableRow>
          <TableCell style={{ paddingLeft: `${depth * 30}px` }}>{category.id}</TableCell>
          <TableCell style={{ paddingLeft: `${depth * 30}px` }}>{category.name}</TableCell>
          <TableCell style={{ paddingLeft: `${depth * 30}px` }}>
            <div className="flex justify-center"> 
              {category.categoryImage ? (
                <img
                  src={`${BASE_URL}${category.categoryImage}`}
                  alt={category.name}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                "No Image"
              )}
            </div>
          </TableCell>
          <TableCell style={{ paddingLeft: `${depth * 20}px` }}>
            <div className="flex justify-center gap-2">
              <Button
                variant="primary"
                className="w-[132px]"
                onClick={() => navigate(`/admin/categories/edit/${category.id}`)}
              >
                Update
              </Button>
              <Button
                variant="danger"
                className="w-[132px]"
                onClick={() => handleDelete(category.id)}
              >
                Delete
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {category.children && category.children.length > 0 && (
          renderCategories(category.children, depth + 1)
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className="container mx-auto p-4 bg-[#F9FAFB] text-[#1E293B]">
      <h1 className="text-3xl font-serif text-[#1E293B] mb-6 text-center">
        Admin Panel - Categories
      </h1>
      <div className="mb-4">
        <Button
          onClick={() => navigate("/admin/categories/create")}
          className="w-[148px] md:w-[248px]"
        >
          Create Category
        </Button>
      </div>
      <Table headers={["ID", "Name", "Image", ""]}>
        {renderCategories(categories)}
      </Table>
    </div>
  );
};

export default Categories;
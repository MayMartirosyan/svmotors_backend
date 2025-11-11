import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils";
import Button from "../../uikit/Button";
import { Table, TableCell, TableRow } from "../../uikit/Table";

interface Category {
  id: number;
  name: string;
  categoryImage?: any | null;
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
      setCategories(response.data);
    } catch (error) {
      toast.error("Не удалось загрузить категории");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту категорию?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/categories/category/${id}`);
      toast.success("Категория удалена");
      fetchCategories();
    } catch (error) {
      toast.error("Не удалось удалить категорию");
    }
  };

  const renderCategories = (categories: Category[], depth = 0) => {
    return categories.map((category) => (
      <React.Fragment key={category.id}>
        <TableRow>
          <TableCell style={{ paddingLeft: `${depth * 30}px` }}>
            {category.id}
          </TableCell>

          <TableCell style={{ paddingLeft: `${depth * 30}px` }}>
            {category.name}
          </TableCell>

          <TableCell style={{ paddingLeft: `${depth * 30}px` }}>
            <div className="flex justify-center">
              {category.categoryImage ? (
                <img
                  src={`${category.categoryImage.medium}`}
                  alt={category.name}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                "Нет изображения"
              )}
            </div>
          </TableCell>

          <TableCell style={{ paddingLeft: `${depth * 20}px` }}>
            <div className="flex justify-center gap-2">
              <Button
                variant="primary"
                className="w-[132px]"
                onClick={() =>
                  navigate(`/admin/categories/edit/${category.id}`)
                }
              >
                Обновить
              </Button>

              <Button
                variant="danger"
                className="w-[132px]"
                onClick={() => handleDelete(category.id)}
              >
                Удалить
              </Button>
            </div>
          </TableCell>
        </TableRow>

        {category.children && category.children.length > 0 &&
          renderCategories(category.children, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="container mx-auto p-4 bg-[#F9FAFB] text-[#1E293B]">
      <h1 className="text-3xl font-serif text-[#1E293B] mb-6 text-center">
        Категории товаров
      </h1>

      <div className="mb-4">
        <Button
          onClick={() => navigate("/admin/categories/create")}
          className="w-[148px] md:w-[248px]"
        >
          Создать категорию
        </Button>
      </div>

      <Table headers={["ID", "Название", "Картинка", "Действия"]}>
        {renderCategories(categories)}
      </Table>
    </div>
  );
};

export default Categories;

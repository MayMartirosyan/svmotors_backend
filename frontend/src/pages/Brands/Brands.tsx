import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils";
import { useDebounce } from "../../hooks/useDebounce";
import Button from "../../uikit/Button";
import Input from "../../uikit/Input";
import { Table, TableCell, TableRow } from "../../uikit/Table";

const Brands: React.FC = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/brands`);
      setBrands(response.data.brands);
    } catch (error) {
      toast.error("Не удалось загрузить бренды");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот бренд?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/brands/brand/${id}`);
      toast.success("Бренд удален");
      fetchBrands();
    } catch (error) {
      toast.error("Не удалось удалить бренд");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-[#F9FAFB] text-[#1E293B]">
      <h1 className="text-3xl font-serif text-[#1E293B] mb-6 text-center">
        Бренды
      </h1>
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-end">
        <div>
          <Button
            onClick={() => navigate("/admin/brands/create")}
            className="w-[148px] md:w-[248px]"
          >
            Создать новый бренд
          </Button>
        </div>
      </div>
      {isLoading && brands.length === 0 ? (
        <p className="text-center">Загрузка...</p>
      ) : (
        <>
          <Table headers={["ID", "Название", "Изображение", "Действия"]}>
            {brands?.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>{brand.id}</TableCell>
                <TableCell>{brand.name}</TableCell>
                <TableCell>
                  {brand.brandImage ? (
                    <img
                      src={`${brand.brandImage.medium}`}
                      alt={brand.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    "Нет изображения"
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/admin/brands/edit/${brand.id}`)}
                    >
                      Обновить
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(brand.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </>
      )}
    </div>
  );
};

export default Brands;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils";
import { useDebounce } from "../../hooks/useDebounce";
import Button from "../../uikit/Button";
import Input from "../../uikit/Input";
import { Table, TableCell, TableRow } from "../../uikit/Table";

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = async (search = searchValue, currentPage = page) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page: currentPage.toString(),
        limit: "20",
      });
      const response = await axios.get(`${BASE_URL}/api/products?${params}`);
      setProducts(response.data.products);
      setTotal(response.data.total);
      setHasMore(response.data.hasMore);
      setPage(currentPage);
    } catch (error) {
      toast.error("Не удалось загрузить продукты");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchProducts = useDebounce(fetchProducts, 1000);

  useEffect(() => {
    fetchProducts("", 1);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setPage(1);
    debouncedFetchProducts(value, 1);
  };

  const handlePageChange = (newPage: number) => {
    fetchProducts(searchValue, newPage);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот продукт?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/products/product/${id}`);
      toast.success("Продукт удален");
      fetchProducts(searchValue, page);
    } catch (error) {
      toast.error("Не удалось удалить продукт");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-[#F9FAFB] text-[#1E293B]">
      <h1 className="text-3xl font-serif text-[#1E293B] mb-6 text-center">
        Продукты
      </h1>
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full">
          <Input
            label="Поиск по названию"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Введите название продукта..."
            className="w-full sm:w-64"
          />
        </div>
        <div>
          <Button
            onClick={() => navigate("/admin/products/create")}
            className="w-[148px] md:w-[248px]"
          >
            Создать новый продукт
          </Button>
        </div>
      </div>
      {isLoading && products.length === 0 ? (
        <p className="text-center">Загрузка...</p>
      ) : (
        <>
          <Table
            headers={[
              "ID",
              "Название",
              "Изображение",
              "Цена",
              "Скидочная цена",
              "Новинка",
              "Категория",
              "Пользователь",
              "Действия",
            ]}
          >
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  {product.productImage ? (
                    <img
                      src={`${
                        product.productImage.startsWith("http") ? "" : BASE_URL
                      }${product.productImage}`}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    "Нет изображения"
                  )}
                </TableCell>
                <TableCell>{product.price} ₽</TableCell>
                <TableCell>
                  {product.discountedPrice
                    ? `${product.discountedPrice} ₽`
                    : "-"}
                </TableCell>
                <TableCell>{product.isNew ? "Да" : "Нет"}</TableCell>
                <TableCell>
                  {product.category?.name || "Нет категории"}
                </TableCell>
                <TableCell>
                  {product.user
                    ? `${product.user.name} ${product.user.surname}`
                    : "Нет пользователя"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() =>
                        navigate(`/admin/products/edit/${product.id}`)
                      }
                    >
                      Обновить
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(product.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
          {total > 0 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Показаны {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} из{" "}
                {total} продуктов
              </p>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Назад
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!hasMore}
                >
                  Вперед
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;

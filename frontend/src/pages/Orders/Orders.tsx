import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL, cleanPrice } from "../../utils";
import { useDebounce } from "../../hooks/useDebounce";
import Button from "../../uikit/Button";
import Input from "../../uikit/Input";
import { Table, TableCell, TableRow } from "../../uikit/Table";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const limit = 24;

  const fetchOrders = useCallback(async (search: string, currentPage: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      const response = await axios.get(`${BASE_URL}/api/checkout/orders?${params}`);
      setOrders(response.data.orders || []);
      setTotal(response.data.total || 0);
      setHasMore(response.data.hasMore || (page * limit < response.data.total));
      setPage(currentPage);
    } catch (error) {
      toast.error("Не удалось загрузить заказы");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const debouncedFetchOrders = useDebounce(fetchOrders, 1000);

  useEffect(() => {
    fetchOrders("", 1);
  }, [fetchOrders]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setPage(1); 
    debouncedFetchOrders(value, 1); 
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= Math.ceil(total / limit)) {
      fetchOrders(searchValue, newPage);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот заказ?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/orders/${orderId}`);
      toast.success("Заказ удален");
      fetchOrders(searchValue, page);
    } catch (error) {
      toast.error("Не удалось удалить заказ");
    }
  };

  const handleViewOrder = (orderId: number) => {
    navigate(`/admin/orders/${orderId}`);
  };

  return (
    <div className="container mx-auto p-4 bg-[#F9FAFB] text-[#1E293B]">
      <h1 className="text-3xl font-serif text-[#1E293B] mb-6 text-center">Заказы</h1>
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full">
          <Input
            label="Поиск"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Введите orderId или имя..."
            className="w-full sm:w-64"
          />
        </div>
      </div>
      {isLoading && orders.length === 0 ? (
        <p className="text-center">Загрузка...</p>
      ) : (
        <>
          <Table
            headers={[
              "ID",
              "Имя",
              "Телефон",
              "Статус",
              "Сумма",
              "Дата создания",
              "Действия",
            ]}
          >
            {orders.map((order) => (
              <TableRow key={order.orderId}>
                <TableCell>{order.orderId}</TableCell>
                <TableCell>{order.checkout?.name || "N/A"}</TableCell>
                <TableCell>{order.checkout?.tel || "N/A"}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{cleanPrice(order.totalAmount)} ₽</TableCell>
                
                <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteOrder(order.orderId)}
                    >
                      Удалить
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleViewOrder(order.orderId)}
                    >
                      Посмотреть
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
          {total > 0 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Показаны {(page - 1) * limit + 1}–{Math.min(page * limit, total)} из {total} заказов
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

export default Orders;
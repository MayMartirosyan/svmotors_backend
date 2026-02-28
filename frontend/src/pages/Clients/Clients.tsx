import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils";
import { useDebounce } from "../../hooks/useDebounce";
import Button from "../../uikit/Button";
import Input from "../../uikit/Input";
import { Table, TableCell, TableRow } from "../../uikit/Table";

const Clients: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchClients = async (search = searchValue, currentPage = page) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page: currentPage.toString(),
        limit: "20",
      });
      const response = await axios.get(`${BASE_URL}/api/clients?${params}`);
      setClients(response.data.clients);
      setTotal(response.data.total);
      setHasMore(response.data.hasMore);
      setPage(currentPage);
    } catch (error) {
      toast.error("Не удалось загрузить клиентов");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetch = useDebounce(fetchClients, 800);

  useEffect(() => {
    fetchClients("", 1);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setPage(1);
    debouncedFetch(value, 1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить клиента?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/clients/${id}`);
      toast.success("Клиент удалён");
      fetchClients(searchValue, page);
    } catch (error) {
      toast.error("Ошибка удаления");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-[#F9FAFB] text-[#1E293B]">
      <h1 className="text-3xl font-serif text-[#1E293B] mb-6 text-center">
        Клиенты
      </h1>

      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full">
          <Input
            label="Поиск по имени, номеру или VIN"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Введите имя / телефон / VIN..."
            className="w-full sm:w-80"
          />
        </div>
        <Button
          onClick={() => navigate("/admin/clients/create")}
          className="max-w-[240px] w-full"
        >
          Добавить клиента
        </Button>
      </div>

      {isLoading && clients.length === 0 ? (
        <p className="text-center">Загрузка...</p>
      ) : (
        <>
          <Table
            headers={[
              "ID",
              "Имя",
              "Фамилия",
              "Телефон",
              "Авто",
              "VIN",
              "Масло",
              "Действия",
            ]}
          >
            {clients.length ? (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.id}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.surname || "-"}</TableCell>
                  <TableCell>{client.phoneNumber}</TableCell>
                  <TableCell>{client.vehicle || "-"}</TableCell>
                  <TableCell>{client.winCode || "-"}</TableCell>
                  <TableCell>{client.oilName || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() =>
                          navigate(`/admin/clients/edit/${client.id}`)
                        }
                      >
                        Редактировать
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(client.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell>Клиентов не найдено</TableCell>
              </TableRow>
            )}
          </Table>

          {total > 0 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Показаны {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} из{" "}
                {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => page > 1 && setPage(page - 1)}
                  disabled={page === 1}
                >
                  Назад
                </Button>
                <Button
                  variant="primary"
                  onClick={() => hasMore && setPage(page + 1)}
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

export default Clients;

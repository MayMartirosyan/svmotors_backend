import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils";
import { Table, TableCell, TableRow } from "../../uikit/Table";

const Requests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/requests`);
      setRequests(response.data.requests);
    } catch (error) {
      toast.error("Не удалось загрузить заявки");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="container mx-auto p-4 bg-[#F9FAFB] text-[#1E293B]">
      <h1 className="text-3xl font-serif text-[#1E293B] mb-6 text-center">
        Заявки
      </h1>
      {isLoading && requests.length === 0 ? (
        <p className="text-center">Загрузка...</p>
      ) : (
        <>
          <Table
            headers={["ID", "Имя", "Телефон", "Комментарий", "Дата создания"]}
          >
            {requests?.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.name}</TableCell>
                <TableCell>{request.phone}</TableCell>
                <TableCell>{request.comment || "Нет комментария"}</TableCell>
                <TableCell>
                  {new Date(request.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </>
      )}
    </div>
  );
};

export default Requests;

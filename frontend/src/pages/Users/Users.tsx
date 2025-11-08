import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils";
import { Table, TableCell, TableRow } from "../../uikit/Table";
import Button from "../../uikit/Button";

const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users`);
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/users/user/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-[#F9FAFB] text-[#1E293B]">
      <h1 className="text-3xl font-serif text-[#1E293B] mb-6 text-center">
        Пользователи
      </h1>
      <Table
        headers={[
          "ID",
          "Name",
          "Surname",
          "Email",
          "Cart Summary",
          "Is Payed",
          "Actions",
        ]}
      >
        {users?.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.surname || "-"}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.cartSummary}</TableCell>
            <TableCell>{user.isPayed ? "Yes" : "No"}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  );
};

export default Users;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils";
import Button from "../../uikit/Button";
import { Table, TableCell, TableRow } from "../../uikit/Table";

const Sliders: React.FC = () => {
  const [sliders, setSliders] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/sliders`);
      setSliders(response.data);
    } catch (error) {
      toast.error("Failed to fetch sliders");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this slider?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/sliders/slider/${id}`);
      toast.success("Slider deleted");
      fetchSliders();
    } catch (error) {
      toast.error("Failed to delete slider");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-[#F9FAFB] text-[#1E293B]">
      <h1 className="text-3xl font-serif text-[#1E293B] mb-6 text-center">
       Слайдеры
      </h1>
      <div className="mb-4">
        <Button
          onClick={() => navigate("/admin/sliders/create")}
          className="w-[148px] md:w-[248px]"
        >
          Создать новый Слайдер
        </Button>
      </div>
      <Table
        headers={["ID", "Image", "Title", "Description", "Link", "Actions"]}
      >
        {sliders?.map((slider) => (
          <TableRow key={slider.id}>
            <TableCell>{slider.id}</TableCell>
            <TableCell>
              {slider.sliderImage ? (
                <img
                  src={`${slider.sliderImage.medium}`}
                  alt={slider.sliderTitle}
                  className="w-full h-16 object-cover rounded"
                />
              ) : (
                "No Image"
              )}
            </TableCell>
            <TableCell>{slider.sliderTitle}</TableCell>
            <TableCell>{slider.sliderDesc || "-"}</TableCell>
            <TableCell>{slider.sliderLink}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/admin/sliders/edit/${slider.id}`)}
                >
                  Update
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(slider.id)}
                >
                 Удалить
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  );
};

export default Sliders;

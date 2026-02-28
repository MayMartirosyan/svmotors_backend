import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils";

import Input from "../../uikit/Input";
import Button from "../../uikit/Button";

interface FormValues {
  name: string;
  surname: string;
  phoneNumber: string;
  vehicle: string;
  winCode: string;
  oilName: string;
  oilFilter: string;
  airFilter: string;
  salonFilter: string;
  fuelFilter: string;
  padsCode: string;
  transmissionFluid: string;
  sparkCode: string;
}

const schema = yup.object().shape({
  name: yup.string().required("Имя обязательно"),
  surname: yup.string().nullable(),
  phoneNumber: yup
    .string()
    .required("Телефон обязателен")
    .matches(/^\+7\d{10}$/, "Формат: +7XXXXXXXXXX (10 цифр после +7)"),
  vehicle: yup.string().nullable(),
  winCode: yup.string().nullable(),
  oilName: yup.string().nullable(),
  oilFilter: yup.string().nullable(),
  airFilter: yup.string().nullable(),
  salonFilter: yup.string().nullable(),
  fuelFilter: yup.string().nullable(),
  padsCode: yup.string().nullable(),
  transmissionFluid: yup.string().nullable(),
  sparkCode: yup.string().nullable(),
});

const ClientForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema as any),
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchClient = async () => {
        try {
          const res = await axios.get(`${BASE_URL}/api/clients/${id}`);
          const client = res.data;

          // Явно маппим snake_case → camelCase
          setValue("name", client.name || "");
          setValue("surname", client.surname || "");
          setValue("phoneNumber", client.phoneNumber || "");
          setValue("vehicle", client.vehicle || "");
          setValue("winCode", client.winCode || "");
          setValue("oilName", client.oilName || "");
          setValue("oilFilter", client.oilFilter || "");
          setValue("airFilter", client.airFilter || "");
          setValue("salonFilter", client.salonFilter || "");
          setValue("fuelFilter", client.fuelFilter || "");
          setValue("padsCode", client.padsCode || "");
          setValue("transmissionFluid", client.transmissionFluid || "");
          setValue("sparkCode", client.sparkCode || "");
        } catch (err) {
          toast.error("Не удалось загрузить клиента");
          console.error(err);
        }
      };
      fetchClient();
    }
  }, [id, setValue]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
    
      const isUpdate = Boolean(id);
      const method = isUpdate ? "put" : "post";
      const url = isUpdate
        ? `${BASE_URL}/api/clients/${id}`
        : `${BASE_URL}/api/clients`;

      const response = await axios[method](url, data);
     
      toast.success(isUpdate ? "Клиент обновлён" : "Клиент добавлен");
      navigate("/admin/clients");
    } catch (err: any) {
      console.error("Ошибка:", err.response?.data || err);
      toast.error(err.response?.data?.error || "Ошибка сохранения");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow rounded">
      <h1 className="text-2xl mb-6 text-[#1E293B] font-serif">
        {id ? "Редактировать клиента" : "Добавить клиента"}
      </h1>

      {isLoading ? (
        <p>Загрузка...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Имя *"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="Фамилия"
            {...register("surname")}
            error={errors.surname?.message}
          />
          <Input
            label="Телефон *"
            {...register("phoneNumber")}
            error={errors.phoneNumber?.message}
            placeholder="+7XXXXXXXXXX"
          />
          <Input
            label="Автомобиль"
            {...register("vehicle")}
            error={errors.vehicle?.message}
          />
          <Input
            label="VIN-код"
            {...register("winCode")}
            error={errors.winCode?.message}
          />
          <Input
            label="Марка масла"
            {...register("oilName")}
            error={errors.oilName?.message}
          />
          <Input
            label="Масляный фильтр"
            {...register("oilFilter")}
            error={errors.oilFilter?.message}
          />
          <Input
            label="Воздушный фильтр"
            {...register("airFilter")}
            error={errors.airFilter?.message}
          />
          <Input
            label="Салонный фильтр"
            {...register("salonFilter")}
            error={errors.salonFilter?.message}
          />
          <Input
            label="Топливный фильтр"
            {...register("fuelFilter")}
            error={errors.fuelFilter?.message}
          />
          <Input
            label="Код колодок"
            {...register("padsCode")}
            error={errors.padsCode?.message}
          />
          <Input
            label="Жидкость КПП"
            {...register("transmissionFluid")}
            error={errors.transmissionFluid?.message}
          />
          <Input
            label="Код свечей"
            {...register("sparkCode")}
            error={errors.sparkCode?.message}
          />

          <Button type="submit" disabled={isLoading}>
            {id ? "Обновить" : "Сохранить"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ClientForm;
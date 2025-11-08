import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL, TRANSLATE_WORDS, cleanPrice } from "../../utils";
import { useParams } from "react-router-dom";

const OrderDetail: React.FC = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/checkout/orders/${orderId}`);
        const data = response.data;
        setOrder(data);
        setStatus(data.status);
      } catch (error) {
        toast.error("Не удалось загрузить детали заказа");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;

    try {
      await axios.patch(`${BASE_URL}/api/checkout/orders/${orderId}/status`, {
        status: newStatus,
      });
      setStatus(newStatus);
      toast.success("Статус обновлён");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Ошибка изменения статуса");
    }
  };

  if (isLoading) return <p className="text-center">Загрузка...</p>;
  if (!order) return <p className="text-center">Заказ не найден</p>;

  const cartItems = order.checkout?.cartItems || [];
  const totalAmount = order.totalAmount || 0;
  const isCashPending = order.checkout?.paymentMethod === "cash" && status === "pending";

  return (
    <div className="container mx-auto p-4 bg-[#F9FAFB] text-[#1E293B]">
      <h1 className="text-3xl font-serif text-[#1E293B] mb-6 text-center">
        Детали заказа #{order.orderId}
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-medium mb-4">Информация о заказе</h2>
        
        <p><strong>Имя:</strong> {order.checkout?.name || "N/A"}</p>
        <p><strong>Фамилия:</strong> {order.checkout?.surname || "N/A"}</p>
        <p><strong>Email:</strong> {order.checkout?.email || "N/A"}</p>
        <p><strong>Телефон:</strong> {order.checkout?.tel || "N/A"}</p>
        <p><strong>Тип доставки:</strong> {TRANSLATE_WORDS[order.checkout?.deliveryType] || "N/A"}</p>
        <p><strong>Время с:</strong> {order.checkout?.timeFrom || "N/A"}</p>
        <p><strong>Время до:</strong> {order.checkout?.timeTo || "N/A"}</p>

        <p>
          <strong>Способ оплаты:</strong>{' '}
          {order.checkout?.paymentMethod === "cash" ? "Наличные" : "Карта"}
        </p>

        {/* СТАТУС + СЕЛЕКТ */}
        <div className="flex items-center gap-3">
          <strong>Статус:</strong>
          <span
            className={`px-2 py-1 rounded text-sm ${
              status === "approved"
                ? "bg-green-100 text-green-800"
                : status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status === "approved" ? "Одобрен" : 
             status === "pending" ? "Ожидает оплаты" : "Отклонён"}
          </span>

          {/* СЕЛЕКТ — ТОЛЬКО ДЛЯ CASH + PENDING */}
          {isCashPending && (
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="ml-2 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              <option value="pending">Ожидает оплаты</option>
              <option value="approved">Одобрен</option>
              <option value="rejected">Отклонён</option>
            </select>
          )}
        </div>

        <p>
          <strong>Дата создания:</strong>{' '}
          {new Date(order.createdAt).toLocaleString()}
        </p>

        <h2 className="text-xl font-medium mt-6 mb-4">Продукты</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Изображение</th>
              <th className="border p-2 text-left">Название</th>
              <th className="border p-2 text-left">Количество</th>
              <th className="border p-2 text-left">Цена за единицу</th>
              <th className="border p-2 text-left">Цена (со скидкой)</th>
              <th className="border p-2 text-left">Итог</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item: any, index: number) => (
              <tr key={index} className="border-t">
                <td className="border p-2">
                  {item?.product?.productImage ? (
                    <img
                      src={`${BASE_URL}${item.product.productImage}`}
                      alt={item?.product?.name || "Product Image"}
                      className="w-24 h-24 object-cover rounded"
                    />
                  ) : (
                    <span>Нет изображения</span>
                  )}
                </td>
                <td className="border p-2">{item?.product?.name}</td>
                <td className="border p-2">{item.qty}</td>
                <td className="border p-2">{cleanPrice(item?.product.price || "0")} ₽</td>
                <td className="border p-2">{cleanPrice(item?.product?.discountedPrice || "0")} ₽</td>
                <td className="border p-2">
                  {cleanPrice(
                    String(
                      (item?.product?.discountedPrice || item?.product?.price || 0) * item.qty
                    )
                  )} ₽
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 text-right">
          <p className="text-xl font-bold">
            Общая сумма: {cleanPrice(totalAmount)} ₽
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
import PDFDocument from "pdfkit";
import { cleanPrice } from "../index";
import QRCode from "qrcode";

const buildQrPayload = (payment: any, checkout: any) => {
  const date = new Date(payment.created_at);

  const t = date
    .toISOString()
    .replace(/[-:]/g, "")
    .split(".")[0]
    .replace("T", "T");

  const s = checkout?.totalAmount ? Number(checkout?.totalAmount) : 0;
  const fn = payment.receipt?.fiscal_storage_number || "";
  const fd = payment.receipt?.fiscal_document_number || "";
  const fp = payment.receipt?.fiscal_attribute || "";

  return `t=${t}&s=${s}&fn=${fn}&fd=${fd}&fp=${fp}&n=1`;
};

export const generateReceiptPdf = async (
  payment: any,
  order: any,
  checkout: any,
  items: any[]
) => {
  const doc = new PDFDocument();
  const buffers: any[] = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  doc.fontSize(20).text("Кассовый чек", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Заказ №${order.orderId}`);
  doc.text(`Дата: ${new Date(payment.created_at).toLocaleString("ru-RU")}`);
  doc.text(`Имя: ${checkout.name} ${checkout.surname}`);
  doc.text(`Email: ${checkout.email}`);
  doc.text(`Телефон: ${checkout.tel}`);

  doc.moveDown();

  doc.fontSize(14).text("Товары:", { underline: true });
  doc.moveDown(0.5);

  items.forEach((item) => {
    const price = item.product.discounted_price || item.product.price;

    doc
      .fontSize(12)
      .text(`${item.product.name} — ${item.qty} шт × ${cleanPrice(price)} ₽`);
  });

  doc.moveDown();

  doc.fontSize(14).font("Helvetica-Bold");
  doc.text(`Итого: ${cleanPrice(checkout.totalAmount)} ₽`);
  doc.font("Helvetica");

  doc.moveDown();

  doc.fontSize(12).text("Фискальные данные:", { underline: true });
  doc.text(`ФД №: ${payment.receipt?.fiscal_document_number || "—"}`);
  doc.text(`ФП: ${payment.receipt?.fiscal_attribute || "—"}`);
  doc.text(`ФН: ${payment.receipt?.fiscal_storage_number || "—"}`);
  doc.text(
    `Статус регистрации: ${payment.receipt?.receipt_registration || "—"}`
  );

  doc.moveDown(1.5);

  const qrPayload = buildQrPayload(payment, checkout);

  const qrImage = await QRCode.toDataURL(qrPayload, {
    margin: 1,
    scale: 6,
  });

  doc.text("QR-код для проверки чека в ФНС:", { align: "center" });
  doc.moveDown(0.5);

  const qr = qrImage.replace(/^data:image\/png;base64,/, "");
  doc.image(Buffer.from(qr, "base64"), {
    align: "center",
    width: 180,
    height: 180,
    fit: [180, 180],
  });

  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
  });
};

import PDFDocument from "pdfkit";
import path from "path";
import { cleanPrice } from "../index";
import QRCode from "qrcode";

function resolveFontPath(fontFile: string) {
  return path.join(__dirname, "fonts", fontFile);
}

export async function generateReceiptPdf(
  payment: any,
  order: any,
  checkout: any,
  items: any[]
) {
  const doc = new PDFDocument({
    margin: 40,
  });

  const buffers: any[] = [];
  doc.on("data", buffers.push.bind(buffers));

  const FONT_BOOK = resolveFontPath("dejavu-sans.book.ttf");
  const FONT_BOLD = resolveFontPath("dejavu-sans.bold.ttf");

//   const qrPayload = `t=${new Date(payment.created_at)
//     .toISOString()
//     .replace(/[-:]/g, "")
//     .slice(0, 15)}00&s=${(checkout.totalAmount / 100).toFixed(2)}&fn=${
//     payment.receipt?.fiscal_storage_number
//   }&i=${payment.receipt?.fiscal_document_number}&fp=${
//     payment.receipt?.fiscal_attribute
//   }&n=1`;

  const qrPayload = [
    `t=${new Date(payment.created_at).toISOString().replace(/[-:]/g, "").slice(0, 15)}00`,
    `s=${Number(checkout.totalAmount)}`,
    `fn=${payment.receipt?.fiscal_storage_number || ""}`,
    `i=${payment.receipt?.fiscal_document_number || ""}`,
    `fp=${payment.receipt?.fiscal_attribute || ""}`,
    `n=1`,
  ].filter(Boolean).join("&");

  const qrImage = await QRCode.toBuffer(qrPayload);

  // ======= HEADER =======
  doc.font(FONT_BOLD).fontSize(22).text("Кассовый чек", {
    align: "center",
  });

  doc.moveDown();

  // ======= ORDER INFO =======
  doc.font(FONT_BOOK).fontSize(14);

  doc.text(`Заказ №${order.orderId}`);
  doc.text(`Дата: ${new Date(payment.created_at).toLocaleString("ru-RU")}`);
  doc.text(`Имя: ${checkout.name} ${checkout.surname}`);
  doc.text(`Email: ${checkout.email}`);
  doc.text(`Телефон: ${checkout.tel}`);

  doc.moveDown(1.2);

  // ======= ITEMS =======
  doc.font(FONT_BOLD).fontSize(16).text("Товары:", { underline: true });
  doc.font(FONT_BOOK).fontSize(14);

  items.forEach((item) => {
    doc.text(
      `${item.product.name}\n${item.qty} × ${cleanPrice(
        item.product.discounted_price || item.product.price
      )} ₽`,
      {
        indent: 10,
      }
    );
    doc.moveDown(0.5);
  });

  doc.moveDown();

  // ======= TOTAL =======
  doc
    .font(FONT_BOLD)
    .fontSize(18)
    .text(`Итого: ${cleanPrice(checkout.totalAmount)} ₽`, {
      align: "right",
    });

  doc.moveDown(1.5);

  // ======= FISCAL DATA + QR ROW =======
  const yStart = doc.y;

  // LEFT COLUMN — FISCAL
  doc.font(FONT_BOLD).fontSize(16).text("Фискальные данные:");
  doc.font(FONT_BOOK).fontSize(13);

  doc.text(`ФД №: ${payment.receipt?.fiscal_document_number || "—"}`);
  doc.text(`ФП: ${payment.receipt?.fiscal_attribute || "—"}`);
  doc.text(`ФН: ${payment.receipt?.fiscal_storage_number || "—"}`);
  doc.text(`Статус: ${payment.receipt?.receipt_registration || "—"}`);

  // RIGHT COLUMN — QR
  doc.image(qrImage, doc.page.width - 40 - 160, yStart, {
    width: 160,
    height: 160,
  });

  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
  });
}

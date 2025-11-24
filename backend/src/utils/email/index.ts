import nodemailer from "nodemailer";
import { cleanPrice } from "..";

export const mailer = nodemailer.createTransport<any>({
  // @ts-ignore
  host: `${process.env.MAIL_HOST || "localhost"}`,
  port: process.env.MAIL_PORT,
  secure: true,
  tls: {
    minVersion: "TLSv1",
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.MAIL_NOREPLY_USER,
    pass: process.env.MAIL_NOREPLY_PASS,
  },
});

type TTRANSLATE_WORDS = {
  [key: string]: string;
};

export const TRANSLATE_WORDS: TTRANSLATE_WORDS = {
  replaceOil: "Замена масла",
  pickup: "Самовывоз",
  approved: "Одобрен",
  pending: "Ожидает оплаты",
  rejected: "Отклонён",
};

export const orderReceiptTemplate = (
  orderId: number,
  checkout: any,
  items: any[],
  totalAmount: number
) => `
    <div style="max-width:600px;mаargin:0 auto;font-family:Arial;background:#ffffff;border:1px solid #e5e5e5;border-radius:10px;padding:25px;">
      
      <div style="text-align:center;">
        <img src="https://kolesnicaauto.ru/logo2.png" width="110" />
        <h2 style="color:#5CB85C;margin-bottom:5px;">Спасибо за ваш заказ!</h2>
        <p style="font-size:15px;color:#333;">Ваш чек по заказу №${orderId}</p>
      </div>

      <hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;"/>

      <h3 style="color:#5CB85C;margin-bottom:10px;">Информация о заказе</h3>

      <p><strong>Имя:</strong> ${checkout.name} ${checkout.surname}</p>
      <p><strong>Email:</strong> ${checkout.email}</p>
      <p><strong>Телефон:</strong> ${checkout.tel}</p>
      <p><strong>Тип доставки:</strong> ${
        TRANSLATE_WORDS[checkout?.deliveryType] || "N/A"
      }</p>

      ${
        checkout.deliveryType === "replace_oil"
          ? `<p><strong>Время:</strong> ${checkout.timeFrom} - ${checkout.timeTo}</p>`
          : ""
      }

      <hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;"/>

      <h3 style="color:#5CB85C">Товары:</h3>

      ${items
        .map(
          (i) => `
        <div style="display:flex;align-items:center;margin-bottom:15px;">
          <img src="${
            i?.product?.product_image?.medium
          }" width="70" style="border-radius:6px;margin-right:12px;"/>
          <div style="font-size:14px;">
              <div><strong>${i.product.name}</strong></div>
              <div>Кол-во: ${i.qty}</div>
              <div style="color:#5CB85C;">Цена: ${
                cleanPrice(i?.product?.discounted_price) ||
                cleanPrice(i?.product?.price)
              } ₽</div>
          </div>
        </div>
      `
        )
        .join("")}

      <hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;"/>

      <h2 style="text-align:right;color:#5CB85C;">Итого: ${cleanPrice(
        totalAmount as unknown as string
      )} ₽</h2>

      <p style="text-align:center;color:#888;margin-top:25px;font-size:12px;">
        Это автоматическое письмо. Пожалуйста, не отвечайте на него.
      </p>
    </div>
`;

export const cashOrderTemplate = (
  orderId: number,
  checkout: any,
  items: any[],
  totalAmount: number
) => `
    <div style="max-width:600px;margin:0 auto;font-family:Arial;background:#ffffff;border:1px solid #e5e5e5;border-radius:10px;padding:25px;">
      
      <div style="text-align:center;">
        <img src="https://kolesnicaauto.ru/logo2.png" width="110" />
        <h2 style="color:#5CB85C;text-align:center;">Ваш заказ №${orderId} оформлен!</h2>
      </div>

      <p style="font-size:15px;color:#333;text-align:center;">
        Вы выбрали оплату наличными.  
        Заберите заказ и оплатите его на месте.
      </p>

      <hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;"/>

      <h3 style="color:#5CB85C">Информация:</h3>
      <p>  <strong>Имя:</strong> ${checkout.name} ${checkout.surname}</p>
      <p>  <strong>Email:</strong> ${checkout.email}</p>
      <p>  <strong>Телефон:</strong> ${checkout.tel}</p>

      <h3 style="color:#5CB85C;margin-top:20px;">Товары:</h3>

      ${items
        .map(
          (i) => `
        <div style="display:flex;align-items:center;margin-bottom:15px;">
          <img src="${
            i?.product?.product_image?.medium
          }" width="70" style="border-radius:6px;margin-right:12px;"/>
          <div style="font-size:14px;">
              <div><strong>${i.product.name}</strong></div>
              <div>Кол-во: ${i.qty}</div>
              <div style="color:#5CB85C;">Цена: ${
                cleanPrice(i?.product?.discounted_price) ||
                cleanPrice(i?.product?.price)
              } ₽.</div>
          </div>
        </div>
      `
        )
        .join("")}

      <hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;"/>

      <h2 style="text-align:right;color:#5CB85C;">Итого: ${cleanPrice(
        totalAmount as unknown as string
      )} ₽.</h2>

      <p style="text-align:center;color:#888;margin-top:25px;font-size:12px;">
        Это автоматическое письмо. Пожалуйста, не отвечайте на него.
      </p>
    </div>
`;

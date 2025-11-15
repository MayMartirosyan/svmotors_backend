import { AppDataSource } from "../config/data-source";
import { Checkout } from "../entities/Checkout";
import { User } from "../entities/User";
import { Order } from "../entities/Order";
import { Product } from "../entities/Product";
import * as jwt from "jsonwebtoken";
import { Not, ILike } from "typeorm";
import axios from "axios";

export class CheckoutService {
  private checkoutRepository = AppDataSource.getRepository(Checkout);
  private orderRepository = AppDataSource.getRepository(Order);
  private userRepository = AppDataSource.getRepository(User);
  private productRepository = AppDataSource.getRepository(Product);

  private async resolveUser(
    token: string | null,
    apiToken: string | null,
    relations: string[] = []
  ): Promise<User> {
    const repo = this.userRepository;

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as { id: number; email: string };
      return await repo.findOneOrFail({
        where: { id: decoded.id, email: decoded.email },
        relations,
      });
    }

    if (apiToken) {
      let guest = await repo.findOne({
        where: { api_token: apiToken },
        relations,
      });
      if (!guest) {
        guest = repo.create({
          api_token: apiToken,
          cart: [],
          cart_summary: 0,
          name: "Anonymous",
          email: `anonymous+${apiToken.replace(/-/g, "")}@example.com`,
        });
        await repo.save(guest);
      }
      return guest;
    }

    throw new Error("No authentication token or API token provided");
  }

  private async createYooKassaPayment(
    totalAmount: number,
    orderId: number,
    description: string
  ) {
    const shopId = process.env.YKASSA_SHOP_ID?.trim();
    const secretKey = process.env.YKASSA_SECRET_KEY?.trim();

    if (!shopId || !secretKey) {
      throw new Error("YooKassa credentials are not configured");
    }

    const idempotenceKey = `${orderId}-${Date.now()}`;
    const returnUrl = `${
      process.env.YKASSA_RETURN_URL ||
      "https://kolesnicaauto.ru/order-confirmation"
    }?orderId=${orderId}`;

    const body = {
      amount: {
        value: totalAmount.toFixed(2),
        currency: "RUB",
      },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: returnUrl,
      },
      description,
      metadata: { orderId },
    };

    try {
      const response = await axios.post(
        "https://api.yookassa.ru/v3/payments",
        body,
        {
          auth: {
            username: shopId,
            password: secretKey,
          },
          headers: {
            "Content-Type": "application/json",
            "Idempotence-Key": idempotenceKey,
          },
        }
      );

      return response.data;
    } catch (err: any) {
      console.error("YooKassa ERROR:", err.response?.data || err.message);
      throw new Error(
        err.response?.data?.description || "YooKassa payment creation failed"
      );
    }
  }

  private async getYooKassaPayment(paymentId: string) {
    const shopId = process.env.YKASSA_SHOP_ID?.trim();
    const secretKey = process.env.YKASSA_SECRET_KEY?.trim();

    if (!shopId || !secretKey) {
      throw new Error("YooKassa credentials are not configured");
    }

    try {
      const response = await axios.get(
        `https://api.yookassa.ru/v3/payments/${paymentId}`,
        {
          auth: {
            username: shopId,
            password: secretKey,
          },
        }
      );

      return response.data;
    } catch (err: any) {
      console.error("YooKassa GET ERROR:", err.response?.data || err.message);
      throw new Error(
        err.response?.data?.description || "Failed to fetch payment"
      );
    }
  }

  async createCheckout(checkoutData: any, token: any, apiToken: any) {
    const {
      name,
      surname,
      email,
      tel,
      deliveryType,
      timeFrom,
      timeTo,
      cartItems,
      paymentMethod,
    } = checkoutData;

    const user = await this.resolveUser(token, apiToken, [
      "cart",
      "cart.product",
    ]);

    if (!cartItems || cartItems.length === 0) {
      throw new Error("Корзина пуста");
    }

    const totalAmount = await this.calculateTotalAmount(cartItems);

    const checkout = this.checkoutRepository.create({
      name,
      surname,
      email,
      tel,
      deliveryType,
      paymentMethod,
      timeFrom: deliveryType === "replaceOil" ? timeFrom : null,
      timeTo: deliveryType === "replaceOil" ? timeTo : null,
      totalAmount,
      cartItems,
      user: token ? user : undefined,
      apiToken: apiToken || undefined,
    });

    const savedCheckout = await this.checkoutRepository.save(checkout);

    const order = this.orderRepository.create({
      status: "pending",
      totalAmount,
      checkout: savedCheckout,
    });

    const savedOrder = await this.orderRepository.save(order);

    let paymentUrl: string | null = null;

    if (paymentMethod === "bankCard") {
      const payment = await this.createYooKassaPayment(
        totalAmount,
        savedOrder.orderId,
        `Оплата заказа №${savedOrder.orderId}`
      );

      paymentUrl = payment?.confirmation?.confirmation_url;
      if (!paymentUrl) throw new Error("Не удалось получить URL оплаты");
    }

    return { checkout: savedCheckout, order: savedOrder, paymentUrl };
  }

  async handleYooKassaCallback(body: any) {
    console.log("YooKassa webhook received:", JSON.stringify(body, null, 2));
  
    const { type, event, object: payment } = body;
  
    if (type !== "notification") {
      console.log("Invalid notification type:", type);
      return;
    }
  
    if (!payment?.id || !payment.metadata?.orderId) {
      console.log("Missing payment.id or metadata.orderId:", {
        id: payment?.id,
        orderId: payment?.metadata?.orderId,
      });
      return;
    }
  
    const orderId = Number(payment.metadata.orderId);
    console.log("Processing orderId:", orderId, "event:", event);
  
    const order = await this.orderRepository.findOne({
      where: { orderId },
      relations: ["checkout", "checkout.user"],
    });
  
    if (!order) {
      console.log("Order not found:", orderId);
      return;
    }
  
    let yookassaPayment = payment;
    try {
      yookassaPayment = await this.getYooKassaPayment(payment.id);
      console.log("Verified payment status from GET:", yookassaPayment.status);
    } catch (err) {
      console.error("GET verification failed, using notification data:", err);
    }
  
    if (
      event === "payment.succeeded" &&
      yookassaPayment.status === "succeeded" &&
      yookassaPayment.paid
    ) {
      order.status = "approved";
      await this.orderRepository.save(order);
  
      const checkout = order.checkout;
  
      // === АВТОРИЗОВАННЫЙ ЮЗЕР ===
      if (checkout?.user) {
        const user = await this.userRepository.findOneBy({ id: checkout.user.id });
        if (user) {
          user.cart = [];
          user.cart_summary = 0;
          await this.userRepository.save(user);
          console.log("Cart cleared for user:", user.id);
        }
      }
      // === ГОСТЬ ПО apiToken ===
      else if (checkout?.apiToken) {
        const guest = await this.userRepository.findOne({
          where: { api_token: checkout.apiToken },
        });
        if (guest) {
          guest.cart = [];
          guest.cart_summary = 0;
          await this.userRepository.save(guest);
          console.log("Cart cleared for guest (apiToken):", checkout.apiToken);
        } else {
          console.warn("Guest not found by apiToken:", checkout.apiToken);
        }
      }
    }
    // === ОТМЕНА ОПЛАТЫ ===
    else if (event === "payment.canceled") {
      console.log("Payment canceled — removing order:", orderId);
      await this.orderRepository.remove(order);
  
      if (order.checkout) {
        const relatedOrders = await this.orderRepository.find({
          where: { checkout: { id: order.checkout.id } },
        });
        if (relatedOrders.length === 0) {
          await this.checkoutRepository.remove(order.checkout);
          console.log("Checkout removed:", order.checkout.id);
        }
      }
    }
    // === ДРУГИЕ СОБЫТИЯ ===
    else {
      console.log("Unhandled event:", event, "status:", yookassaPayment.status);
    }
  
    console.log("Webhook processed successfully for order:", orderId);
  }

  async cancelOrder(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { orderId },
      relations: ["checkout"],
    });

    if (!order) return;

    await this.orderRepository.remove(order);

    if (order.checkout) {
      const relatedOrders = await this.orderRepository.find({
        where: { checkout: { id: order.checkout.id } },
      });
      if (relatedOrders.length === 0) {
        await this.checkoutRepository.remove(order.checkout);
      }
    }
  }
  
  async getAllOrders(page: number = 1, limit: number = 24, search: string = "") {
    try {
      const query = this.orderRepository
        .createQueryBuilder("order")
        .leftJoinAndSelect("order.checkout", "checkout")
        .leftJoinAndSelect("checkout.user", "user")
        .skip((page - 1) * limit)
        .take(limit);

      if (search) {
        query.where(
          "(CAST(order.orderId AS TEXT) LIKE :search OR user.name ILIKE :searchLike)",
          { search: `%${search}%`, searchLike: `%${search}%` }
        );
      }

      const [orders, total] = await query.getManyAndCount();
      return { orders, total };
    } catch (error: any) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }
  }

  async getUserOrders(token: string) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const userId = decoded.id;

    const orders = await this.orderRepository.find({
      where: { checkout: { user: { id: userId } } },
      relations: ["checkout", "checkout.user"],
      order: { created_at: "DESC" },
    });

    for (const order of orders) {
      if (order.checkout?.cartItems) {
        order.checkout.cartItems = await Promise.all(
          order.checkout.cartItems.map(async (item: any) => {
            const product = await this.productRepository.findOneBy({ id: item.productId });
            return {
              ...item,
              product: product
                ? {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    discounted_price: product.discounted_price,
                    product_image: product.product_image,
                  }
                : null,
            };
          })
        );
      }
    }

    return { orders };
  }

  async getOrderByOrderId(orderId: number) {
    try {
      const order = await this.orderRepository.findOne({
        where: { orderId },
        relations: ["checkout", "checkout.user"],
      });
      if (!order) throw new Error("Order not found");

      if (order.checkout && order.checkout.cartItems) {
        order.checkout.cartItems = await Promise.all(
          order.checkout.cartItems.map(async (item: any) => {
            const product = await this.productRepository.findOneBy({ id: item.productId });
            return {
              ...item,
              product: product
                ? {
                    id: product?.id,
                    name: product?.name,
                    price: product?.price,
                    discounted_price: product?.discounted_price,
                    sku: product?.sku,
                    product_image: product?.product_image,
                    article: product?.article,
                  }
                : null,
            };
          })
        );
      }

      return order;
    } catch (error: any) {
      throw new Error(`Failed to fetch order by orderId: ${error.message}`);
    }
  }

  async updateOrderStatus(orderId: number, status: "approved" | "rejected") {
    const order = await this.orderRepository.findOne({
      where: { orderId },
      relations: ["checkout"],
    });

    if (!order) throw new Error("Order not found");
    if (order.checkout.paymentMethod === "bankCard") {
      throw new Error("Cannot change status for card payments");
    }
    if (order.status !== "pending") {
      throw new Error("Can only change status from pending");
    }

    order.status = status;
    return await this.orderRepository.save(order);
  }

  async deleteOrder(orderId: number) {
    try {
      const order = await this.orderRepository.findOneBy({ orderId });
      if (!order) throw new Error("Order not found");
      await this.orderRepository.remove(order);
      return { message: "Order deleted successfully" };
    } catch (error: any) {
      throw new Error(`Failed to delete order: ${error.message}`);
    }
  }

  private async calculateTotalAmount(cartItems: { productId: number; qty: number }[]) {
    let total = 0;
    for (const item of cartItems) {
      const product = await this.productRepository.findOneBy({ id: item.productId });
      if (product) {
        const price = product.discounted_price || product.price;
        total += price * item.qty;
      }
    }
    return total;
  }
}
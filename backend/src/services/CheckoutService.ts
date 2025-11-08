import { AppDataSource } from "../config/data-source";
import { Checkout } from "../entities/Checkout";
import { User } from "../entities/User";
import { Order } from "../entities/Order";
import { Product } from "../entities/Product";
import * as jwt from "jsonwebtoken";
import { Not, ILike } from "typeorm";

export class CheckoutService {
  private checkoutRepository = AppDataSource.getRepository(Checkout);
  private orderRepository = AppDataSource.getRepository(Order);
  private userRepository = AppDataSource.getRepository(User);
  private productRepository = AppDataSource.getRepository(Product);



  private async resolveUser(token: string | null, apiToken: string | null, relations: string[] = []): Promise<User> {
    const repo = this.userRepository;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { id: number; email: string };
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

  async createCheckout(checkoutData: any, token: string | null, apiToken: string | null) {
    const { name, surname, email, tel, deliveryType, timeFrom, timeTo, cartItems,paymentMethod } = checkoutData;

    let user = await this.resolveUser(token, apiToken, ["cart", "cart.product"]);

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
    });

    const savedCheckout = await this.checkoutRepository.save(checkout);

    const status = paymentMethod === 'bankCard' ? 'approved' : 'pending';

    const order = this.orderRepository.create({
      status,
      totalAmount,
      checkout: savedCheckout,
    });
    const savedOrder = await this.orderRepository.save(order);

    // Очищаем корзину и обновляем summary
    user.cart = [];
    user.cart_summary = 0;
    await this.userRepository.save(user);

    if (!token && apiToken) {
      await this.userRepository.remove(user);
    }

    return { checkout: savedCheckout, order: savedOrder };
  }

  async getAllOrders(page: number = 1, limit: number = 24, search: string = "") {
    try {
      const query = this.orderRepository
        .createQueryBuilder("order")
        .leftJoinAndSelect("order.checkout", "checkout")
        .leftJoinAndSelect("checkout.user", "user")
        .skip((page - 1) * limit)
        .take(limit);

      // Поиск по orderId или user.name
      if (search) {
        query.where(
          "(CAST(order.orderId AS TEXT) LIKE :search OR user.name ILIKE :searchLike)",
          {
            search: `%${search}%`,
            searchLike: `%${search}%`,
          }
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
              product: product ? {
                id: product.id,
                name: product.name,
                price: product.price,
                discounted_price: product.discounted_price,
                product_image: product.product_image,
              } : null,
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
              product: product ? {
                id: product?.id,
                name: product?.name,
                price: product?.price,
                discounted_price: product?.discounted_price,
                sku: product?.sku,
                product_image: product?.product_image,
                article: product?.article,
              } : null,
            };
          })
        );
      }

      return order;
    } catch (error: any) {
      throw new Error(`Failed to fetch order by orderId: ${error.message}`);
    }
  }

  async updateOrderStatus(orderId: number, status: 'approved' | 'rejected') {
    const order = await this.orderRepository.findOne({
      where: { orderId },
      relations: ['checkout'],
    });
  
    if (!order) throw new Error('Order not found');
    if (order.checkout.paymentMethod === 'bankCard') {
      throw new Error('Cannot change status for card payments');
    }
    if (order.status !== 'pending') {
      throw new Error('Can only change status from pending');
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
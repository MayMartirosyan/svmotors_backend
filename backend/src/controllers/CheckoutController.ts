import { Request, Response } from "express";
import { CheckoutService } from "../services/CheckoutService";
import { toCamelCase } from "../utils";

export class CheckoutController {
  private checkoutService: CheckoutService;
  private static instance: CheckoutController;

  constructor() {
    this.checkoutService = new CheckoutService();
  }

  static getInstance(): CheckoutController {
    if (!CheckoutController.instance) {
      CheckoutController.instance = new CheckoutController();
    }
    return CheckoutController.instance;
  }

  async createCheckout(req: Request, res: Response) {
    try {
      const checkoutData = req.body;
      const token = req.headers.authorization?.split(" ")[1] || null;
      const apiToken = (req.headers["x-api-token"] as string) || null;
      const { checkout, order, paymentUrl } = await this.checkoutService.createCheckout(
        checkoutData,
        token,
        apiToken
      );
      
      res.status(201).json({
        checkout: toCamelCase(checkout),
        order: toCamelCase(order),
        paymentUrl
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllOrders(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = 24;
      const search = (req.query.search as string) || "";

      const { orders, total } = await this.checkoutService.getAllOrders(
        page,
        limit,
        search
      );
      res.json({
        orders: orders.map((order) => toCamelCase(order)),
        total,
        hasMore: page * limit < total,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async yookassaCallback(req: Request, res: Response) {
    try {

      const expectedLogin = process.env.YKASSA_WEBHOOK_LOGIN;
      const expectedPassword = process.env.YKASSA_WEBHOOK_PASSWORD;
  
      if (expectedLogin && expectedPassword) {
        const authHeader = req.headers.authorization || "";
        const expected = "Basic " + Buffer.from(`${expectedLogin}:${expectedPassword}`).toString("base64");
        if (authHeader !== expected) {
          return res.status(401).send("Unauthorized");
        }
      }
  
      await this.checkoutService.handleYooKassaCallback(req.body);
      res.status(200).send("OK");
    } catch (error: any) {
      console.error("YooKassa callback error:", error);
      res.status(500).send("Error");
    }
  }

  async getUserOrders(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) throw new Error("Unauthorized");

      const { orders } = await this.checkoutService.getUserOrders(token);
      res.json({
        orders: orders.map((o) => toCamelCase(o)),
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async getOrderByOrderId(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await this.checkoutService.getOrderByOrderId(orderId);
      res.json(toCamelCase(order));
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.orderId);
      const { status } = req.body; // 'approved' | 'rejected'
  
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
  
      const order = await this.checkoutService.updateOrderStatus(orderId, status);
      res.json(toCamelCase(order));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteOrder(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.orderId);
      await this.checkoutService.deleteOrder(orderId);
      res.status(200).json({ message: "Order deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

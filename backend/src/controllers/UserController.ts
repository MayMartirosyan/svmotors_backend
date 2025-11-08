// src/controllers/UserController.ts
import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { toCamelCase } from "../utils";
import { getExistingEntity } from "../utils/FileUtlis";
import * as crypto from "crypto";

export class UserController {
  private userService: UserService;
  private static instance: UserController;

  constructor() {
    this.userService = new UserService();
  }

  static getInstance(): UserController {
    if (!UserController.instance) {
      UserController.instance = new UserController();
    }
    return UserController.instance;
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const users = await this.userService.getAllUsers(
        limit ? parseInt(limit as string) : undefined
      );
      const camelCaseUsers = users.map((user) => toCamelCase(user));
      res.json(camelCaseUsers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const user = await this.userService.getUserById(id);
      const camelCaseUser = toCamelCase(user);
      res.json(camelCaseUser);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { name, surname, email, password, repeat_password } = req.body;
      const { user, token } = await this.userService.registerUser({
        name,
        surname,
        email,
        password,
        repeat_password,
      });
      res.status(201).json({ user: toCamelCase(user), token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const apiToken = req.headers["x-api-token"] as string;
      const { user, token } = await this.userService.loginUser({
        email,
        password,
        apiToken,
      });
      res.json({ user: toCamelCase(user), token });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async getUserByToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }
      const user = await this.userService.getUserByToken(token);
      res.json(toCamelCase(user));
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async addToFavorites(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }
      const productId = parseInt(req.body.productId);
      const favorites = await this.userService.addToFavoritesByToken(
        token,
        productId
      );
      res.json(toCamelCase(favorites));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeFromFavorites(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }
      const productId = parseInt(req.body.productId);
      const favorites = await this.userService.removeFromFavoritesByToken(
        token,
        productId
      );
      res.json(toCamelCase(favorites));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addToCart(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1] || null;
      const productId = parseInt(req.body.productId);
      const qty = parseInt(req.body.qty);
      const apiToken = req.headers["x-api-token"] as string;

      if (!productId || !qty || (!token && !apiToken)) {
        return res.status(400).json({
          error: "Missing required fields: productId, qty, or token/apiToken",
        });
      }
      const { cart, cart_summary } = await this.userService.addToCart(
        token,
        productId,
        qty,
        apiToken
      );
      res.json({ cart: toCamelCase(cart), cartSummary: cart_summary });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCart(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1] || null;
      const cartItemId = parseInt(req.body.cartItemId);
      const qty = parseInt(req.body.qty);
      const apiToken = req.headers["x-api-token"] as string;

      if (!cartItemId || !qty || (!token && !apiToken)) {
        return res.status(400).json({
          error: "Missing required fields: cartItemId, qty, or token/apiToken",
        });
      }
      const { cart, cart_summary } = await this.userService.updateCart(
        token,
        cartItemId,
        qty,
        apiToken
      );
      res.json({ cart: toCamelCase(cart), cartSummary: cart_summary });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCart(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1] || null;
      const apiToken = req.headers["x-api-token"] as string;
      if (!token && !apiToken) {
        return res.status(401).json({ error: "No token or apiToken provided" });
      }
      const cart = await this.userService.getCart(token, apiToken);
      res.json(toCamelCase(cart));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeFromCart(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1] || null;
      const cartItemId = parseInt(req.params.cartItemId);
      const apiToken = req.headers["x-api-token"] as string;
      if (!token && !apiToken) {
        return res.status(401).json({ error: "No token or apiToken provided" });
      }
      if (!cartItemId) {
        return res.status(400).json({ error: "Cart item ID is required" });
      }
      const { cart, cart_summary } = await this.userService.removeFromCart(
        token,
        cartItemId,
        apiToken
      );
      res.json(toCamelCase({ cart, cartSummary: cart_summary }));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const { birthday_date, gender, surname, tel, name } = req.body;
      const profileData = { birthday_date, gender, surname, tel, name };
      const user = await this.userService.updateProfile(userId, profileData);
      res.json(toCamelCase(user));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const result = await this.userService.changePassword(
        userId,
        oldPassword,
        newPassword,
        confirmPassword
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const user = await getExistingEntity(
        this.userService,
        "getUserById",
        id,
        "User not found"
      );
      await this.userService.deleteUser(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}

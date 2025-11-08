import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  private static instance: AuthController;

  async register(req: Request, res: Response) {
    const { username, password } = req.body;
    try {
      const user = await this.authService.register(username, password);
      res.status(201).json({ message: "User registered successfully", user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    try {
      const { token } = await this.authService.login(username, password);
      res.status(200).json({ message: "Login successful", token });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}
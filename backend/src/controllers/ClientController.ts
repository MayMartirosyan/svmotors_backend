import { Request, Response } from "express";
import { ClientService } from "../services/ClientService";
import { toCamelCase, toSnakeCase } from "../utils"; // ← добавь toSnakeCase, если нет — создай
import { Client } from "../entities/Client";

export class ClientController {
  private clientService: ClientService;
  private static instance: ClientController;

  constructor() {
    this.clientService = new ClientService();
  }

  static getInstance(): ClientController {
    if (!ClientController.instance) {
      ClientController.instance = new ClientController();
    }
    return ClientController.instance;
  }

  async getAllClients(req: Request, res: Response) {
    try {
      const { search, page = "1", limit = "20" } = req.query;

      const parsedPage = parseInt(page as string);
      const parsedLimit = parseInt(limit as string);

      const result = await this.clientService.getAllClients(
        search as string,
        parsedPage,
        parsedLimit
      );

      const camelCaseClients = result.clients.map((client) =>
        toCamelCase(client)
      );

      res.json({
        clients: camelCaseClients,
        total: result.total,
        hasMore: result.hasMore,
        currentPage: result.currentPage,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getClientById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const client = await this.clientService.getClientById(id);
      res.json(toCamelCase(client));
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createClient(req: Request, res: Response) {
    try {
      // Фронт отправляет camelCase → преобразуем в snake_case
      const snakeCaseData = toSnakeCase(req.body);

      if (!snakeCaseData.name || !snakeCaseData.phone_number) {
        throw new Error("Имя и номер телефона обязательны");
      }

      const newClient = await this.clientService.createClient(snakeCaseData);
      res.status(201).json(toCamelCase(newClient));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateClient(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      // Фронт отправляет camelCase → преобразуем в snake_case
      const snakeCaseData = toSnakeCase(req.body);

      const existingClient = await this.clientService.getClientById(id);

      // Обновляем только те поля, которые пришли
      const clientToUpdate = { ...existingClient };

      Object.keys(snakeCaseData).forEach((key) => {
        if (snakeCaseData[key] !== undefined) {
          (clientToUpdate as any)[key] = snakeCaseData[key] || null;
        }
      });

      const updatedClient = await this.clientService.updateClient(id, clientToUpdate);
      res.json(toCamelCase(updatedClient));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteClient(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await this.clientService.deleteClient(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
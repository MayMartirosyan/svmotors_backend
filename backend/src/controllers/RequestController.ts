import { Request, Response } from "express";
import { RequestService } from "../services/RequestService";
import { toCamelCase } from "../utils";

export class RequestController {
  private requestService: RequestService;
  private static instance: RequestController;

  constructor() {
    this.requestService = new RequestService();
  }

  static getInstance(): RequestController {
    if (!RequestController.instance) {
      RequestController.instance = new RequestController();
    }
    return RequestController.instance;
  }

  async getAllRequests(req: Request, res: Response) {
    try {
      const requests = await this.requestService.getAllRequests();
      const camelCaseRequests = requests.map((request) => toCamelCase(request));
      res.json({ requests: camelCaseRequests });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createRequest(req: Request, res: Response) {
    try {
      const { name, phone, comment } = req.body;
      const requestData = { name, phone, comment };
      const newRequest = await this.requestService.createRequest(requestData);
      const camelCaseRequest = toCamelCase(newRequest);
      res.status(201).json(camelCaseRequest);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
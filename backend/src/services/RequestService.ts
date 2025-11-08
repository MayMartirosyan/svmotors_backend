import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Request } from "../entities/Request";


export class RequestService {
  private requestRepository: Repository<Request>;

  constructor() {
    this.requestRepository = AppDataSource.getRepository(Request);
  }

  async getAllRequests() {
    try {
      return await this.requestRepository.find({ order: { created_at: "DESC" } });
    } catch (error: any) {
      throw new Error(`Failed to fetch requests: ${error.message}`);
    }
  }

  async createRequest(requestData: Partial<Request>) {
    try {
      const request = this.requestRepository.create(requestData);
      return await this.requestRepository.save(request);
    } catch (error: any) {
      throw new Error(`Failed to create request: ${error.message}`);
    }
  }
}
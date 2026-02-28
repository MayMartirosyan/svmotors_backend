import { AppDataSource } from "../config/data-source";
import { Client } from "../entities/Client";

export class ClientService {
  private clientRepository = AppDataSource.getRepository(Client);

  async getAllClients(search?: string, page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;

      const query = this.clientRepository.createQueryBuilder("client");

      if (search) {
        query.where(
          "(client.name ILIKE :search OR " +
            "client.phone_number ILIKE :search OR " +
            "client.win_code ILIKE :search)",
          { search: `%${search}%` }
        );
      }

      const [clients, total] = await Promise.all([
        query
          .orderBy("client.created_at", "DESC")
          .skip(offset)
          .take(limit)
          .getMany(),
        query.getCount(),
      ]);

      return {
        clients,
        total,
        hasMore: clients.length === limit,
        currentPage: page,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }
  }

  async getClientById(id: number) {
    try {
      const client = await this.clientRepository.findOneBy({ id });
      if (!client) {
        throw new Error("Client not found");
      }
      return client;
    } catch (error: any) {
      throw new Error(`Failed to fetch client by ID: ${error.message}`);
    }
  }

  async createClient(clientData: Partial<Client>) {
    try {
      const client = this.clientRepository.create(clientData);
      return await this.clientRepository.save(client);
    } catch (error: any) {
      throw new Error(`Failed to create client: ${error.message}`);
    }
  }

  async updateClient(id: number, clientData: Partial<Client>) {
    try {
      const client = await this.getClientById(id);
      Object.assign(client, clientData);
      return await this.clientRepository.save(client);
    } catch (error: any) {
      throw new Error(`Failed to update client: ${error.message}`);
    }
  }

  async deleteClient(id: number) {
    try {
      const client = await this.getClientById(id);
      await this.clientRepository.remove(client);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete client: ${error.message}`);
    }
  }
}

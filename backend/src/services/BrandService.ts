import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Brand } from "../entities/Brand";

export class BrandService {
  private brandRepository: Repository<Brand>;

  constructor() {
    this.brandRepository = AppDataSource.getRepository(Brand);
  }

  async getAllBrands(limit: number = 10) {
    try {
      const brands = await this.brandRepository
        .createQueryBuilder("brand")
        .orderBy("brand.created_at", "DESC")
        .take(limit)
        .getMany();
      return brands;
    } catch (error: any) {
      throw new Error(`Failed to fetch brands: ${error.message}`);
    }
  }

  async getBrandById(id: number) {
    try {
      const brand = await this.brandRepository.findOne({ where: { id } });
      if (!brand) throw new Error("Brand not found");
      return brand;
    } catch (error: any) {
      throw new Error(`Failed to fetch brand by ID: ${error.message}`);
    }
  }

  async createBrand(brandData: Partial<Brand>) {
    try {
      const brand = this.brandRepository.create(brandData);
      return await this.brandRepository.save(brand);
    } catch (error: any) {
      throw new Error(`Failed to create brand: ${error.message}`);
    }
  }

  async updateBrand(id: number, brandData: Partial<Brand>) {
    try {
      const brand = await this.getBrandById(id);
      Object.assign(brand, brandData);
      return await this.brandRepository.save(brand);
    } catch (error: any) {
      throw new Error(`Failed to update brand: ${error.message}`);
    }
  }

  async deleteBrand(id: number) {
    try {
      const brand = await this.getBrandById(id);
      await this.brandRepository.remove(brand);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete brand: ${error.message}`);
    }
  }
}
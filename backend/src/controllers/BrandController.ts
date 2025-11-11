import { Request, Response } from "express";
import { BrandService } from "../services/BrandService";
import { toCamelCase } from "../utils";
import { deleteFile, getImagePath } from "../utils/FileUtlis";
import { Brand } from "../entities/Brand";

export class BrandController {
  private brandService: BrandService;
  private static instance: BrandController;

  constructor() {
    this.brandService = new BrandService();
  }

  static getInstance(): BrandController {
    if (!BrandController.instance) {
      BrandController.instance = new BrandController();
    }
    return BrandController.instance;
  }

  async getAllBrands(req: Request, res: Response) {
    try {
      const { limit = "10" } = req.query;
      const parsedLimit = parseInt(limit as string);
      const brands = await this.brandService.getAllBrands(parsedLimit);
      const camelCaseBrands = brands.map((brand) => toCamelCase(brand));
      res.json({ brands: camelCaseBrands });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getBrandById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const brand = await this.brandService.getBrandById(id);
      const camelCaseBrand = toCamelCase(brand);
      res.json(camelCaseBrand);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createBrand(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const snakeCaseData: any = {
        name,
        brand_image: getImagePath(req),
      };

      const newBrand = await this.brandService.createBrand(snakeCaseData);
      const camelCaseBrand = toCamelCase(newBrand);
      res.status(201).json(camelCaseBrand);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateBrand(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;

      const brandToUpdate: Partial<Brand> = {
        id,
        name,
      };

      const existingBrand = await this.brandService.getBrandById(id);

      const newImagePath = getImagePath(req);

      if (newImagePath) {
        if (existingBrand.brand_image) {
          await deleteFile(existingBrand.brand_image);
        }
        brandToUpdate.brand_image = newImagePath;
      }

      const updatedBrand = await this.brandService.updateBrand(
        id,
        brandToUpdate
      );
      const camelCaseBrand = toCamelCase(updatedBrand);
      res.json(camelCaseBrand);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteBrand(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await this.brandService.deleteBrand(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}

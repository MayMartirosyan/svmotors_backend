import { Request, Response } from "express";
import { CategoryService } from "../services/CategoryService";
import { toCamelCase } from "../utils";
import { deleteFile, getExistingEntity, getImagePath } from "../utils/FileUtlis";

export class CategoryController {
  private categoryService: CategoryService;
  private static instance: CategoryController;

  constructor() {
    this.categoryService = new CategoryService();
  }

  static getInstance(): CategoryController {
    if (!CategoryController.instance) {
      CategoryController.instance = new CategoryController();
    }
    return CategoryController.instance;
  }

  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await this.categoryService.getAllCategories();
      const camelCaseCategories = categories.map((category:any) => toCamelCase(category));
      res.json(camelCaseCategories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCategoryById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const category = await this.categoryService.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      const camelCaseCategory = toCamelCase(category);
      res.json(camelCaseCategory);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createCategory(req: Request, res: Response) {
    try {
      const { name, parentId } = req.body;
      const snakeCaseData: any = {
        name,
        category_image: getImagePath(req),
      };
      if (parentId) {
        snakeCaseData.parent = { id: parseInt(parentId) };
      }

      const newCategory = await this.categoryService.createCategory(snakeCaseData);
      const camelCaseCategory = toCamelCase(newCategory);
      res.status(201).json(camelCaseCategory);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name, parentId } = req.body;

      const existingCategory: any = await getExistingEntity(
        this.categoryService,
        "getCategoryById",
        id,
        "Category not found"
      );

      const snakeCaseData: any = { name };
      if (parentId !== undefined) {
        snakeCaseData.parent = parentId ? { id: parseInt(parentId) } : null;
      }

      const newImagePath = getImagePath(req);
      if (newImagePath) {
        if (existingCategory.category_image) {
          await deleteFile(existingCategory.category_image);
        }
        snakeCaseData.category_image = newImagePath;
      }

      const updatedCategory = await this.categoryService.updateCategory(id, snakeCaseData);
      const camelCaseCategory = toCamelCase(updatedCategory);
      res.json(camelCaseCategory);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const category: any = await getExistingEntity(
        this.categoryService,
        "getCategoryById",
        id,
        "Category not found"
      );

      if (category.category_image) {
        await deleteFile(category.category_image);
      }

      await this.categoryService.deleteCategory(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
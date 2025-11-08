import { AppDataSource } from "../config/data-source";
import { Category } from "../entities/Category";
import { TreeRepository } from "typeorm";

export class CategoryService {
  private categoryRepository: TreeRepository<Category>;

  constructor() {
    this.categoryRepository = AppDataSource.getTreeRepository(Category); // Используем TreeRepository
  }

  private generateSlug(name: string, id?: number): string {
    const base = name
      .toLowerCase()
      .replace(/[^а-яёa-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');
    return id ? `${base}-${id}` : base;
  }

  async getAllCategories() {
    try {
      return await this.categoryRepository.findTrees(); // Теперь это работает
    } catch (error: any) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  async getCategoryById(id: number) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
        relations: ["children", "parent"], // Загружаем детей и родителя
      });
      if (!category) {
        throw new Error("Category not found");
      }
      return category;
    } catch (error: any) {
      throw new Error(`Failed to fetch category by ID: ${error.message}`);
    }
  }

  async createCategory(categoryData: Partial<Category>) {
    try {
      const category = this.categoryRepository.create(categoryData);
      category.slug = this.generateSlug(categoryData.name!, category.id);
  
      if (categoryData.parent) {
        category.parent = await this.getCategoryById(categoryData.parent.id);
      }
      return await this.categoryRepository.save(category);
    } catch (error: any) {
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  async updateCategory(id: number, categoryData: Partial<Category>) {
    try {
      const category = await this.getCategoryById(id);
      Object.assign(category, categoryData);
  
      if (categoryData.name) {
        category.slug = this.generateSlug(categoryData.name, id);
      }
  
      if (categoryData.parent) {
        category.parent = await this.getCategoryById(categoryData.parent.id);
      }
      return await this.categoryRepository.save(category);
    } catch (error: any) {
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  async deleteCategory(id: number) {
    try {
      const category = await this.getCategoryById(id);
      await this.categoryRepository.remove(category);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }
}
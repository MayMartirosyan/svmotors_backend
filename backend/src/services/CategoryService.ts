import { AppDataSource } from "../config/data-source";
import { Category } from "../entities/Category";
import { TreeRepository } from "typeorm";

export class CategoryService {
  private categoryRepository: TreeRepository<Category>;

  constructor() {
    this.categoryRepository = AppDataSource.getTreeRepository(Category);
  }

  private transliterate(str: string): string {
    const map: { [key: string]: string } = {
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      е: "e",
      ё: "e",
      ж: "zh",
      з: "z",
      и: "i",
      й: "i",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      п: "p",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "kh",
      ц: "ts",
      ч: "ch",
      ш: "sh",
      щ: "sch",
      ъ: "",
      ы: "y",
      ь: "",
      э: "e",
      ю: "yu",
      я: "ya",
      А: "A",
      Б: "B",
      В: "V",
      Г: "G",
      Д: "D",
      Е: "E",
      Ё: "E",
      Ж: "Zh",
      З: "Z",
      И: "I",
      Й: "I",
      К: "K",
      Л: "L",
      М: "M",
      Н: "N",
      О: "O",
      П: "P",
      Р: "R",
      С: "S",
      Т: "T",
      У: "U",
      Ф: "F",
      Х: "Kh",
      Ц: "Ts",
      Ч: "Ch",
      Ш: "Sh",
      Щ: "Sch",
      Ъ: "",
      Ы: "Y",
      Ь: "",
      Э: "E",
      Ю: "Yu",
      Я: "Ya",
    };

    return str
      .split("")
      .map((char) => map[char] || char)
      .join("");
  }

  private generateSlug(name: string, id?: number): string {
    if (!name) return id ? `category-${id}` : 'category';
  
    const transliterated = this.transliterate(name);
  
    const slug = transliterated
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')    
      .replace(/-+/g, '-'); 
  
    return slug || (id ? `category-${id}` : 'category');
  }

  async getAllCategories() {
    try {
      return await this.categoryRepository.findTrees();
    } catch (error: any) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  async getCategoryById(id: number) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
        relations: ["children", "parent"],
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
  
      if (!category.slug && categoryData.name) {
        category.slug = this.generateSlug(categoryData.name);
      }
  
      if (categoryData.parent) {
        category.parent = await this.getCategoryById(categoryData.parent.id);
      }
  
      const saved = await this.categoryRepository.save(category);
      

      if (!category?.slug?.includes(saved.id.toString())) {
        saved.slug = `${saved.slug}-${saved.id}`;
        await this.categoryRepository.save(saved);
      }
  
      return saved;
    } catch (error: any) {
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }
  
  async updateCategory(id: number, categoryData: Partial<Category>) {
    try {
      const category = await this.getCategoryById(id);
      

      const oldSlug = category.slug;
  
      Object.assign(category, categoryData);
  
      
      if (categoryData.name && categoryData.name !== category.name) {
        const baseSlug = this.generateSlug(categoryData.name);
        const hasIdInSlug = oldSlug && oldSlug.endsWith(`-${id}`);
        category.slug = hasIdInSlug ? `${baseSlug}-${id}` : baseSlug;
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

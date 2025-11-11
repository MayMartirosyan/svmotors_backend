import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";
import { toCamelCase } from "../utils";
import { AppDataSource } from "../config/data-source";
import { Category } from "../entities/Category";
import { Product } from "../entities/Product";
import {
  deleteFile,
  getExistingEntity,
  getImagePath,
} from "../utils/FileUtlis";

export class ProductController {
  private productService: ProductService;
  private static instance: ProductController;

  constructor() {
    this.productService = new ProductService();
  }

  static getInstance(): ProductController {
    if (!ProductController.instance) {
      ProductController.instance = new ProductController();
    }
    return ProductController.instance;
  }

  async getAllProducts(req: Request, res: Response) {
    try {
      const {
        category,
        search,
        page = "1",
        limit = "20",
        isRecommended,
      } = req.query;

      const parsedPage = parseInt(page as string);
      const parsedLimit = parseInt(limit as string);

      const result = await this.productService.getAllProducts(
        category as string,
        search as string,
        parsedPage,
        parsedLimit,
        isRecommended === "true"
      );

      const camelCaseProducts = result.products.map((product) =>
        toCamelCase(product)
      );

      res.json({
        products: camelCaseProducts,
        total: result.total,
        hasMore: result.hasMore,
        currentPage: result.currentPage,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProductsBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const {
        page = "1",
        limit = "12",
        sort = "price_asc",
        minPrice,
        maxPrice,
      } = req.query;

      const result = await this.productService.getProductsBySlug(
        slug,
        parseInt(page as string),
        parseInt(limit as string),
        sort as "price_asc" | "price_desc",
        minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice ? parseFloat(maxPrice as string) : undefined
      );

      const camelCaseProducts = result.products.map((p) =>
        toCamelCase(p)
      );

      res.json({
        products: camelCaseProducts,
        total: result.total,
        hasMore: result.hasMore,
        currentPage: result.currentPage,
        minPrice: result.minPrice,
        maxPrice: result.maxPrice,
        limit: result.limit,
        categoryName: result.categoryName,
      });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const product = await this.productService.getProductById(id);
      res.json(toCamelCase(product));
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getProductBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug;
      const product = await this.productService.getProductBySlug(slug);
      res.json(toCamelCase(product));
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createProduct(req: Request, res: Response) {
    try {
      const {
        name,
        price,
        discountedPrice,
        isNew,
        isRecommended,
        categoryId,
        description,
        shortDescription,
      } = req.body;

      if (!categoryId) {
        throw new Error("Category is required for product creation");
      }

      const normalizedDiscounted =
        discountedPrice === "" ||
        discountedPrice === "null" ||
        discountedPrice === "undefined"
          ? null
          : parseFloat(discountedPrice);

      const snakeCaseData: any = {
        name,
        price: parseFloat(price),
        discounted_price: normalizedDiscounted,
        is_new: isNew === "true",
        is_recommended: isRecommended === "true",
        category_id: parseInt(categoryId),
        description,
        short_description: shortDescription,
        product_image: getImagePath(req),
      };

      const newProduct = await this.productService.createProduct(snakeCaseData);
      res.status(201).json(toCamelCase(newProduct));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      let {
        name,
        price,
        discountedPrice,
        isNew,
        isRecommended,
        categoryId,
        description,
        shortDescription,
        sku,
        article,
      } = req.body;

      if (!categoryId) {
        throw new Error("Category is required for product update");
      }

      const existingProduct = await getExistingEntity<Product>(
        this.productService,
        "getProductById",
        id,
        "Product not found"
      );

      const categoryRepository = AppDataSource.getRepository(Category);
      const category = await categoryRepository.findOneBy({
        id: parseInt(categoryId),
      });

      if (!category) {
        throw new Error(`Category with id ${categoryId} not found`);
      }

      // ✅ Правильная обработка скидки — пустое значение → NULL
      const normalizedDiscount =
        discountedPrice === "" ||
        discountedPrice === "null" ||
        discountedPrice === "undefined" ||
        discountedPrice === undefined
          ? null
          : parseFloat(discountedPrice);

      const productToUpdate: Partial<Product> = {
        id,
        name,
        description,
        short_description: shortDescription,
        price: price ? parseFloat(price) : undefined,
        discounted_price: normalizedDiscount,
        is_new: isNew === "true",
        is_recommended: isRecommended === "true",
        category_id: parseInt(categoryId),
        sku,
        article,
        category,
      };

      const newImagePath = getImagePath(req);
      if (newImagePath) {
        if (existingProduct.product_image) {
          await deleteFile(existingProduct.product_image);
        }
        productToUpdate.product_image = newImagePath;
      }

      const updatedProduct = await this.productService.updateProduct(
        id,
        productToUpdate
      );

      res.json(toCamelCase(updatedProduct));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      const product = await getExistingEntity<Product>(
        this.productService,
        "getProductById",
        id,
        "Product not found"
      );

      if (product.product_image) {
        await deleteFile(product.product_image);
      }

      await this.productService.deleteProduct(id);

      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}

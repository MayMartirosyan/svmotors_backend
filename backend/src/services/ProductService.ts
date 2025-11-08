import { AppDataSource } from "../config/data-source";
import { Category } from "../entities/Category";
import { Product } from "../entities/Product";

export class ProductService {
  private productRepository = AppDataSource.getRepository(Product);

  async getAllProducts(
    category?: string,
    search?: string,
    page: number = 1,
    limit: number = 20,
    isRecommended?: boolean
  ) { 
    try {
      const offset = (page - 1) * limit;
      const query = this.productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.category", "category")
        .skip(offset)
        .take(limit);

      const whereConditions: string[] = [];
      const params: any = {};

      if (category) {
        whereConditions.push("category.name = :category");
        params.category = category;
      }

      if (search) {
        whereConditions.push(
          "(product.name ILIKE :search OR product.sku ILIKE :search OR product.article ILIKE :search)"
        );
        params.search = `%${search}%`;
      }

      if (isRecommended) {
        whereConditions.push("product.is_recommended = :isRecommended");
        params.isRecommended = true;
      }

      if (whereConditions.length > 0) {
        query.where(whereConditions.join(" AND "), params);
      }

      const [products, total] = await Promise.all([
        query.getMany(),
        this.productRepository
          .createQueryBuilder("product")
          .leftJoin("product.category", "category")
          .where(
            whereConditions.length > 0 ? whereConditions.join(" AND ") : "1=1",
            params
          )
          .getCount(),
      ]);

      return {
        products,
        total,
        hasMore: products.length === limit,
        currentPage: page,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  async getNewProducts(limit: number = 10) {
    try {
      const query = this.productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.category", "category")
        .where("product.is_new = :isNew", { isNew: true })
        .orderBy("product.created_at", "DESC")
        .take(limit);

      return await query.getMany();
    } catch (error: any) {
      throw new Error(`Failed to fetch new products: ${error.message}`);
    }
  }

  async getRecommendedProducts(limit: number = 12) {
    try {
      const query = this.productRepository
        .createQueryBuilder("product")
        .where("product.is_recommended = :isRecommended", { isRecommended: true })
        .orderBy("product.created_at", "DESC")
        .leftJoinAndSelect("product.category", "category")
        .take(limit);

      return await query.getMany();
    } catch (error: any) {
      throw new Error(`Failed to fetch recommended products: ${error.message}`);
    }
  }

  // async getProductsByCategory(
  //   categoryName: string,
  //   page: number = 1,
  //   limit: number = 12,
  //   sort: "price_asc" | "price_desc" = "price_asc",
  //   minPrice?: number,
  //   maxPrice?: number
  // ) {
  //   try {
  //     const offset = (page - 1) * limit;
  //     const query = this.productRepository
  //       .createQueryBuilder("product")
  //       .leftJoinAndSelect("product.category", "category")
  //       .where("category.name = :categoryName", { categoryName });

  //     // Фильтрация по цене
  //     if (minPrice !== undefined) {
  //       query.andWhere("product.price >= :minPrice", { minPrice });
  //     }
  //     if (maxPrice !== undefined) {
  //       query.andWhere("product.price <= :maxPrice", { maxPrice });
  //     }

  //     // Сортировка
  //     if (sort === "price_asc") {
  //       query.orderBy("product.price", "ASC");
  //     } else if (sort === "price_desc") {
  //       query.orderBy("product.price", "DESC");
  //     }

  //     const [products, total] = await Promise.all([
  //       query.skip(offset).take(limit).getMany(),
  //       query.getCount(),
  //     ]);

  //     // Дополнительные данные с правильным JOIN
  //     const [minProduct, maxProduct] = await Promise.all([
  //       this.productRepository
  //         .createQueryBuilder("product")
  //         .select("MIN(product.price)", "minPrice")
  //         .leftJoin("product.category", "category")
  //         .where("category.name = :categoryName", { categoryName })
  //         .getRawOne(),
  //       this.productRepository
  //         .createQueryBuilder("product")
  //         .select("MAX(product.price)", "maxPrice")
  //         .leftJoin("product.category", "category")
  //         .where("category.name = :categoryName", { categoryName })
  //         .getRawOne(),
  //     ]);

  //     return {
  //       products,
  //       total,
  //       hasMore: products.length === limit,
  //       currentPage: page,
  //       minPrice: minProduct?.minPrice || 0,
  //       maxPrice: maxProduct?.maxPrice || 0,
  //       limit,
  //     };
  //   } catch (error: any) {
  //     throw new Error(`Failed to fetch products by category: ${error.message}`);
  //   }
  // }

  async getProductsBySlug(
    slug: string,
    page: number = 1,
    limit: number = 12,
    sort: "price_asc" | "price_desc" = "price_asc",
    minPrice?: number,
    maxPrice?: number
  ) {
    const offset = (page - 1) * limit;
  
    const category = await AppDataSource.getRepository(Category).findOne({
      where: { slug },
    });
  
    if (!category) throw new Error("Category not found");
  
    const query = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .where("product.category_id = :categoryId", { categoryId: category.id });
  
    if (minPrice !== undefined) query.andWhere("product.price >= :minPrice", { minPrice });
    if (maxPrice !== undefined) query.andWhere("product.price <= :maxPrice", { maxPrice });
  
    if (sort === "price_asc") query.orderBy("product.price", "ASC");
    else query.orderBy("product.price", "DESC");
  
    const [products, total] = await Promise.all([
      query.skip(offset).take(limit).getMany(),
      query.getCount(),
    ]);
  
    const [minProduct, maxProduct] = await Promise.all([
      this.productRepository
        .createQueryBuilder("p")
        .select("MIN(p.price)", "minPrice")
        .where("p.category_id = :categoryId", { categoryId: category.id })
        .getRawOne(),
      this.productRepository
        .createQueryBuilder("p")
        .select("MAX(p.price)", "maxPrice")
        .where("p.category_id = :categoryId", { categoryId: category.id })
        .getRawOne(),
    ]);
  
    return {
      products,
      total,
      hasMore: products.length === limit,
      currentPage: page,
      minPrice: minProduct?.minPrice || 0,
      maxPrice: maxProduct?.maxPrice || 0,
      limit,
      categoryName: category.name,
    };
  }

  async getProductById(id: number) {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ["category"],
      });
      if (!product) {
        throw new Error("Product not found");
      }
      return product;
    } catch (error: any) {
      throw new Error(`Failed to fetch product by ID: ${error.message}`);
    }
  }

  async getProductBySlug(slug: string) {
    try {
      const product = await this.productRepository.findOne({
        where: { slug },
        relations: ["category"],
      });
      if (!product) {
        throw new Error("Product not found");
      }
      const relatedProducts = await this.productRepository
        .createQueryBuilder("related_product")
        .leftJoinAndSelect("related_product.category", "category")
        .where("related_product.category_id = :categoryId", { categoryId: product.category_id })
        .andWhere("related_product.id != :id", { id: product.id })
        .take(8)
        .getMany();

      return { ...product, relatedProducts };
    } catch (error: any) {
      throw new Error(`Failed to fetch product by slug: ${error.message}`);
    }
  }



  async createProduct(productData: Partial<Product>) {
    try {
      const name: string = productData?.name || "";

      const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
        
      const randomNumber = Math.floor(Math.random() * 100);
      const slug = `${baseSlug}-${randomNumber}`;
      const product = this.productRepository.create({ ...productData, slug });
      return await this.productRepository.save(product);
    } catch (error: any) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  async updateProduct(id: number, productData: Partial<Product>) {
    try {
      const product = await this.getProductById(id);
      Object.assign(product, productData);
      return await this.productRepository.save(product);
    } catch (error: any) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  async deleteProduct(id: number) {
    try {
      const product = await this.getProductById(id);
      await this.productRepository.remove(product);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }
}
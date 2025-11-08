import { Request, Response } from "express";
import { toCamelCase } from "../../utils";
import { ProductService } from "../../services/ProductService";
import { SliderService } from "../../services/SliderService";
import { BrandService } from "../../services/BrandService";

export class HomeApiController {
  private sliderService: SliderService;
  private productService: ProductService;
  private brandService: BrandService;
  private static instance: HomeApiController;

  constructor() {
    this.sliderService = new SliderService();
    this.productService = new ProductService();
    this.brandService = new BrandService();
  }

  static getInstance(): HomeApiController {
    if (!HomeApiController.instance) {
      HomeApiController.instance = new HomeApiController();
    }
    return HomeApiController.instance;
  }

  async getHomePageData(req: Request, res: Response) {
    try {
      const [sliders, newProducts, recommendedProducts, brands] = await Promise.all([
        this.sliderService.getAllSliders(),
        this.productService.getNewProducts(10),
        this.productService.getRecommendedProducts(12),
        this.brandService.getAllBrands(10),
      ]);

      const camelCaseSliders = sliders.map((slider: any) => toCamelCase(slider));
      const camelCaseNewProducts = newProducts.map((product: any) => toCamelCase(product));
      const camelCaseRecommendedProducts = recommendedProducts.map((product: any) => toCamelCase(product));
      const camelCaseBrands = brands.map((brand: any) => toCamelCase(brand));

      const response = {
        sliders: camelCaseSliders,
        newProducts: camelCaseNewProducts,
        recommendedProducts: camelCaseRecommendedProducts,
        brands: camelCaseBrands,
      };

      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
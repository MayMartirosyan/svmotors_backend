import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { uploadAndConvertSingle } from "../utils/multerConfig";

const router = Router();
const productController = ProductController.getInstance();

router.get("/", productController.getAllProducts.bind(productController));
router.get("/product/:id", productController.getProductById.bind(productController));
router.get("/product-by-slug/:slug", productController.getProductBySlug.bind(productController));
// router.get("/products-by-category", productController.getProductsByCategory.bind(productController));
router.get("/products-by-category-slug/:slug", productController.getProductsBySlug.bind(productController));

router.post(
  "/product",
  uploadAndConvertSingle("productImage"),
  productController.createProduct.bind(productController)
);
router.put(
  "/product/:id",
  uploadAndConvertSingle("productImage"),
  productController.updateProduct.bind(productController)
);
router.delete(
  "/product/:id",
  productController.deleteProduct.bind(productController)
);

export default router;
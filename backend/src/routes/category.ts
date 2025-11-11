import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import { uploadToS3SingleMiddlewareUniversal } from "../utils/media/middlewares";
import upload from "../utils/multerConfig";

const router = Router();
const categoryController = CategoryController.getInstance();

router.get("/", categoryController.getAllCategories.bind(categoryController));
router.get(
  "/category/:id",
  categoryController.getCategoryById.bind(categoryController)
);
router.post(
  "/category/",
  upload.single('category_image'),
  uploadToS3SingleMiddlewareUniversal("categories"),
  categoryController.createCategory.bind(categoryController)
);
router.put(
  "/category/:id",
  upload.single('category_image'),
  uploadToS3SingleMiddlewareUniversal("categories"),
  categoryController.updateCategory.bind(categoryController)
);
router.delete(
  "/category/:id",
  categoryController.deleteCategory.bind(categoryController)
);

export default router;
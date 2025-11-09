import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import { uploadAndConvertSingle, uploadAndConvertSingleWithS3 } from "../utils/multerConfig";

const router = Router();
const categoryController = CategoryController.getInstance();

router.get("/", categoryController.getAllCategories.bind(categoryController));
router.get(
  "/category/:id",
  categoryController.getCategoryById.bind(categoryController)
);
router.post(
  "/category/",
  uploadAndConvertSingleWithS3("category_image"),
  categoryController.createCategory.bind(categoryController)
);
router.put(
  "/category/:id",
  uploadAndConvertSingleWithS3("category_image"),
  categoryController.updateCategory.bind(categoryController)
);
router.delete(
  "/category/:id",
  categoryController.deleteCategory.bind(categoryController)
);

export default router;
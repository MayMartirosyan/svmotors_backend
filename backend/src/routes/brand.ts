import { Router } from "express";
import { BrandController } from "../controllers/BrandController";
import { uploadAndConvertSingle } from "../utils/multerConfig";

const router = Router();
const brandController = BrandController.getInstance();

router.get("/", brandController.getAllBrands.bind(brandController));
router.get("/brand/:id", brandController.getBrandById.bind(brandController));
router.post(
  "/brand",
  uploadAndConvertSingle("brandImage"),
  brandController.createBrand.bind(brandController)
);
router.put(
  "/brand/:id",
  uploadAndConvertSingle("brandImage"),
  brandController.updateBrand.bind(brandController)
);
router.delete("/brand/:id", brandController.deleteBrand.bind(brandController));

export default router;
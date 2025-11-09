import { Router } from "express";
import { BrandController } from "../controllers/BrandController";
import { uploadAndConvertSingleWithS3 } from "../utils/multerConfig";

const router = Router();
const brandController = BrandController.getInstance();

router.get("/", brandController.getAllBrands.bind(brandController));
router.get("/brand/:id", brandController.getBrandById.bind(brandController));
router.post(
  "/brand",
  uploadAndConvertSingleWithS3("brandImage"),
  brandController.createBrand.bind(brandController)
);
router.put(
  "/brand/:id",
  uploadAndConvertSingleWithS3("brandImage"),
  brandController.updateBrand.bind(brandController)
);
router.delete("/brand/:id", brandController.deleteBrand.bind(brandController));

export default router;
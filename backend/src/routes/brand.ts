import { Router } from "express";
import { BrandController } from "../controllers/BrandController";

import { uploadToS3SingleMiddlewareUniversal } from "../utils/media/middlewares";
import upload from "../utils/multerConfig";

const router = Router();
const brandController = BrandController.getInstance();

router.get("/", brandController.getAllBrands.bind(brandController));
router.get("/brand/:id", brandController.getBrandById.bind(brandController));
router.post(
  "/brand",
  upload.single('brandImage'),
  uploadToS3SingleMiddlewareUniversal("brands"),
  brandController.createBrand.bind(brandController)
);
router.put(
  "/brand/:id",
  upload.single('brandImage'),
  uploadToS3SingleMiddlewareUniversal("brands"),
  brandController.updateBrand.bind(brandController)
);
router.delete("/brand/:id", brandController.deleteBrand.bind(brandController));

export default router;
import { Router } from "express";
import { SliderController } from "../controllers/SliderController";

import { uploadToS3SingleMiddlewareUniversal } from "../utils/media/middlewares";
import upload from "../utils/multerConfig";

const router = Router();
const sliderController = SliderController.getInstance();

router.get("/", sliderController.getAllSliders.bind(sliderController));
router.get(
  "/slider/:id",
  sliderController.getSliderById.bind(sliderController)
);
router.post(
  "/slider",
  upload.single("sliderImage"),
  uploadToS3SingleMiddlewareUniversal("sliders"),
  sliderController.createSlider.bind(sliderController)
);
router.put(
  "/slider/:id",
  upload.single("sliderImage"),
  uploadToS3SingleMiddlewareUniversal("sliders"),
  sliderController.updateSlider.bind(sliderController)
);
router.delete(
  "/slider/:id",
  sliderController.deleteSlider.bind(sliderController)
);

export default router;

import { Router } from "express";
import { SliderController } from "../controllers/SliderController";
import { uploadAndConvertSingleWithS3 } from "../utils/multerConfig";

const router = Router();
const sliderController = SliderController.getInstance();

router.get("/", sliderController.getAllSliders.bind(sliderController));
router.get(
  "/slider/:id",
  sliderController.getSliderById.bind(sliderController)
);
router.post(
  "/slider",
  uploadAndConvertSingleWithS3("sliderImage"),
  sliderController.createSlider.bind(sliderController)
);
router.put(
  "/slider/:id",
  uploadAndConvertSingleWithS3("sliderImage"),
  sliderController.updateSlider.bind(sliderController)
);
router.delete(
  "/slider/:id",
  sliderController.deleteSlider.bind(sliderController)
);

export default router;

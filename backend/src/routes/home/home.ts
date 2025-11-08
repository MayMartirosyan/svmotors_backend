import { Router } from "express";
import { HomeApiController } from "../../controllers/home/HomeApiController";

const router = Router();
const homeApiController = HomeApiController.getInstance();
router.get("/", homeApiController.getHomePageData.bind(homeApiController));

export default router;

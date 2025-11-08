import { Router } from "express";
import { RequestController } from "../controllers/RequestController";

const router = Router();
const requestController = RequestController.getInstance();

router.get("/", requestController.getAllRequests.bind(requestController));
router.post("/", requestController.createRequest.bind(requestController));

export default router;
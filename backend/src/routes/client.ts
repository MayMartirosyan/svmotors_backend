// src/routes/clientRoutes.ts
import { Router } from "express";
import { ClientController } from "../controllers/ClientController";

const router = Router();
const clientController = ClientController.getInstance();

router.get("/", clientController.getAllClients.bind(clientController));
router.get("/:id", clientController.getClientById.bind(clientController));
router.post("/", clientController.createClient.bind(clientController));
router.put("/:id", clientController.updateClient.bind(clientController));
router.delete("/:id", clientController.deleteClient.bind(clientController));

export default router;
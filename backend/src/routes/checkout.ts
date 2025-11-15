import { Router } from "express";
import { CheckoutController } from "../controllers/CheckoutController";

const router = Router();
const checkoutController = CheckoutController.getInstance();

router.post("/save", (req, res) => checkoutController.createCheckout(req, res));
router.post("/yookassa-callback", (req, res) =>
  checkoutController.yookassaCallback(req, res)
);

// router.post("/cancel", (req, res) => checkoutController.cancelCheckout(req, res));

router.get("/orders", (req, res) => checkoutController.getAllOrders(req, res));
router.get("/orders/:orderId", (req, res) =>
  checkoutController.getOrderByOrderId(req, res)
);
router.get("/user-orders", (req, res) => checkoutController.getUserOrders(req, res));

router.patch("/orders/:orderId/status", (req, res) => 
  checkoutController.updateOrderStatus(req, res)
);

router.delete("/orders/:orderId", (req, res) =>
  checkoutController.deleteOrder(req, res)
);

export default router;

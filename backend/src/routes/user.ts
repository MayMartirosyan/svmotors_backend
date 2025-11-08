// src/routes/userRoutes.ts
import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();
const userController = UserController.getInstance();

router.get("/", userController.getAllUsers.bind(userController));
router.post("/register", userController.register.bind(userController));
router.post("/login", userController.login.bind(userController));
router.post("/favorites", userController.addToFavorites.bind(userController)); 
router.delete("/favorites", userController.removeFromFavorites.bind(userController)); 
router.post("/cart", userController.addToCart.bind(userController));
router.put("/cart", userController.updateCart.bind(userController));
router.get("/cart", userController.getCart.bind(userController));
router.delete("/cart/:cartItemId", userController.removeFromCart.bind(userController));
router.delete("/user/:id", userController.deleteUser.bind(userController));
router.get("/me", userController.getUserByToken.bind(userController));
router.put("/user/:id/profile", userController.updateProfile.bind(userController));
router.post("/user/:id/change-password", userController.changePassword.bind(userController));

export default router;
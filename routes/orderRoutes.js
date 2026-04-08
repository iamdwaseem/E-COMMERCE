import { Router } from "express";
import { createOrder, getOrdersByUser } from "../controllers/orderController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

router.post("/create", requireAuth, createOrder);
router.get("/user/:userId", requireAuth, getOrdersByUser);

export default router;


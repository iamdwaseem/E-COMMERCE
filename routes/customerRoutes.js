import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import { getMyDeals, getMyOrders, getMyProfile } from "../controllers/customerController.js";

const router = Router();

router.get("/me", requireAuth, getMyProfile);
router.get("/orders", requireAuth, getMyOrders);
router.get("/deals", requireAuth, getMyDeals);

export default router;


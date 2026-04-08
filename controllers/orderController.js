import mongoose from "mongoose";
import Deal from "../models/Deal.js";
import Order from "../models/Order.js";

export async function createOrder(req, res) {
  try {
    const { dealId, address } = req.body ?? {};
    const userId = req.user?._id ? String(req.user._id) : null;

    if (!dealId || !mongoose.Types.ObjectId.isValid(dealId)) {
      return res.status(400).json({ message: "Valid dealId is required" });
    }
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!address || typeof address !== "string" || !address.trim()) {
      return res.status(400).json({ message: "address is required" });
    }

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    if (deal.status !== "completed") {
      return res.status(400).json({ message: "Deal is not completed" });
    }

    const order = await Order.create({
      userId,
      productId: deal.productId,
      dealId: deal._id,
      pricePaid: Number(deal.discountPrice ?? 0),
      address: address.trim(),
      status: "pending"
    });

    return res.status(201).json(order);
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getOrdersByUser(req, res) {
  try {
    const { userId } = req.params;
    if (!userId || typeof userId !== "string" || !userId.trim()) {
      return res.status(400).json({ message: "userId is required" });
    }

    const isAdmin = req.user?.role === "admin";
    const isSelf = String(req.user?._id ?? "") === userId.trim();
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const orders = await Order.find({ userId: userId.trim() })
      .sort({ createdAt: -1 })
      .populate("productId")
      .populate("dealId");

    return res.status(200).json(orders);
  } catch (err) {
    console.error("getOrdersByUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


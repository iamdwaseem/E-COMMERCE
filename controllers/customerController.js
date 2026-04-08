import Order from "../models/Order.js";
import Deal from "../models/Deal.js";

export async function getMyProfile(req, res) {
  return res.status(200).json(req.user);
}

export async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ userId: String(req.user._id) })
      .sort({ createdAt: -1 })
      .populate("productId")
      .populate("dealId");
    return res.status(200).json(orders);
  } catch (err) {
    console.error("getMyOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getMyDeals(req, res) {
  try {
    const uid = String(req.user._id);
    const deals = await Deal.find({
      $or: [{ creatorId: uid }, { joinedUsers: uid }]
    })
      .sort({ createdAt: -1 })
      .populate("productId");
    return res.status(200).json(deals);
  } catch (err) {
    console.error("getMyDeals error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


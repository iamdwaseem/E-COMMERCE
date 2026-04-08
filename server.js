import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import dealRoutes from "./routes/dealRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";

const PORT = Number.parseInt(process.env.PORT ?? "5000", 10);

await connectDB();

app.use("/api/products", productRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


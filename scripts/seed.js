import "dotenv/config";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

function envOr(name, fallback) {
  const v = process.env[name];
  return v && String(v).trim() ? String(v).trim() : fallback;
}

async function upsertUser({ name, email, password, role }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    existing.name = name;
    existing.role = role;
    existing.passwordHash = passwordHash;
    await existing.save();
    return existing;
  }

  return await User.create({ name, email: normalizedEmail, passwordHash, role });
}

async function main() {
  await connectDB();

  const adminEmail = envOr("SEED_ADMIN_EMAIL", "admin@example.com");
  const adminPass = envOr("SEED_ADMIN_PASSWORD", "Admin@12345");

  const vendorEmail = envOr("SEED_VENDOR_EMAIL", "vendor@example.com");
  const vendorPass = envOr("SEED_VENDOR_PASSWORD", "Vendor@12345");

  const customerEmail = envOr("SEED_CUSTOMER_EMAIL", "customer@example.com");
  const customerPass = envOr("SEED_CUSTOMER_PASSWORD", "Customer@12345");

  const admin = await upsertUser({
    name: "Admin",
    email: adminEmail,
    password: adminPass,
    role: "admin"
  });

  const vendor = await upsertUser({
    name: "Vendor",
    email: vendorEmail,
    password: vendorPass,
    role: "vendor"
  });

  const customer = await upsertUser({
    name: "Customer",
    email: customerEmail,
    password: customerPass,
    role: "customer"
  });

  const count = Number.parseInt(envOr("SEED_PRODUCTS_COUNT", "1200"), 10);
  const total = Number.isFinite(count) && count > 0 ? count : 1200;

  const categories = [
    "Electronics",
    "Home",
    "Kitchen",
    "Fashion",
    "Sports",
    "Books",
    "Toys",
    "Beauty"
  ];
  const adjectives = [
    "Premium",
    "Smart",
    "Compact",
    "Portable",
    "Classic",
    "Eco",
    "Ultra",
    "Pro"
  ];
  const items = [
    "Headphones",
    "Watch",
    "Backpack",
    "Lamp",
    "Bottle",
    "Shoes",
    "Keyboard",
    "Mouse",
    "Chair",
    "Blender",
    "Jacket",
    "Camera",
    "Speaker",
    "Book"
  ];

  const products = Array.from({ length: total }, (_, i) => {
    const cat = categories[i % categories.length];
    const adj = adjectives[i % adjectives.length];
    const item = items[i % items.length];
    const price = Number((((i % 200) + 10) * 1.35).toFixed(2));
    return {
      name: `${adj} ${item} ${i + 1}`,
      price,
      description: `${cat} • ${adj} ${item} built for everyday use.`,
      image: `https://picsum.photos/seed/product-${i + 1}/800/600`,
      category: cat
    };
  });

  // Ensure idempotency: clear previous seeded vendor products, then recreate
  await Product.deleteMany({ vendorId: vendor._id });
  const batchSize = 200;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize).map((p) => ({ ...p, vendorId: vendor._id }));
    // eslint-disable-next-line no-await-in-loop
    await Product.insertMany(batch);
  }

  console.log("Seed complete.");
  console.log("Accounts:");
  console.log(`- admin:    ${adminEmail} / ${adminPass}`);
  console.log(`- vendor:   ${vendorEmail} / ${vendorPass}`);
  console.log(`- customer: ${customerEmail} / ${customerPass}`);
  console.log(`Products seeded: ${products.length}`);
  console.log(`VendorId: ${vendor._id}`);
  console.log(`CustomerId: ${customer._id}`);
}

try {
  await main();
} catch (err) {
  console.error("Seed failed:", err);
  process.exitCode = 1;
} finally {
  await mongoose.connection.close().catch(() => {});
}


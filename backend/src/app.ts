import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/data-source";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import authRoutes from "./routes/auth";
import categoryRoutes from "./routes/category";
import sliderRoutes from "./routes/slider";
import userRoutes from "./routes/user";
import productRoutes from "./routes/product";
import brandRoutes from "./routes/brand";
import requestRoutes from "./routes/request";
import checkoutRoutes from "./routes/checkout";
import homeRoutes from "./routes/home/home";

dotenv.config();

const app = express();

const uploadDir = path.join(__dirname, "../Uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/Uploads", express.static(uploadDir));
app.use(express.static(path.join(__dirname, "../../frontend/dist")));


app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/home-data", homeRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/checkout", checkoutRoutes);



app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

if (!process.env.NODE_ENV) {
  console.warn("NODE_ENV is not set. Defaulting to development.");
  process.env.NODE_ENV = "development";
}

AppDataSource.initialize()
  .then(() => {
    console.log("Connected to PostgreSQL");
    const port = process.env.SERVER_PORT || 8000;
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to PostgreSQL:", error);
  });

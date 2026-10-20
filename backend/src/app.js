import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config/index.js";
import { pool } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestMetrics } from "./middleware/requestMetrics.js";
import { getPrometheusMetrics } from "./controllers/metricsController.js";

import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import searchRoutes from "./routes/search.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import trackingRoutes from "./routes/tracking.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import referralRoutes from "./routes/referral.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import cookThisRoutes from "./routes/cookThisRoutes.js";
import homeRoutes from "./routes/home.routes.js";
import phase8Routes from "./routes/phase8.routes.js";

const app = express();
if (config.NODE_ENV === "production") app.set("trust proxy", 1);

app.use(
  cors({
    origin: config.CORS_ORIGINS,
  }),
);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:"],
      },
    },
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(requestMetrics);

app.get("/metrics", getPrometheusMetrics);

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "unhealthy" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/home", homeRoutes);
app.use("/api", cookThisRoutes);
app.use("/api/phase8", phase8Routes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", trackingRoutes);
app.use("/api", reviewRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

if (config.NODE_ENV === "production") {
  const frontendDirectory = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    "frontend",
    "dist",
  );

  app.use(
    express.static(frontendDirectory, {
      index: false,
      setHeaders: (res, filePath) => {
        const hashedAsset =
          dirname(filePath) === join(frontendDirectory, "assets") &&
          /-[\w-]{8,}\.[\w]+$/.test(filePath);
        res.set(
          "Cache-Control",
          hashedAsset ? "public, max-age=31536000, immutable" : "no-cache",
        );
      },
    }),
  );
  app.use((req, res, next) => {
    if (
      req.method !== "GET" ||
      req.path.startsWith("/api/") ||
      !req.accepts("html")
    ) {
      return next();
    }
    res.set("Cache-Control", "no-cache");
    return res.sendFile(join(frontendDirectory, "index.html"));
  });
}

app.use(errorHandler);

export default app;

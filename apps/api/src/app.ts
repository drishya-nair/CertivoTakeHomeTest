import express from "express";
import cors from "cors";
import morgan from "morgan";
import logger from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import apiRoutes from "./routes";
import env from "./config/env";
import helmet from "helmet";

const app = express();

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(helmet());
app.use(express.json());
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Routes
app.use("/", apiRoutes);

// Error handling
app.use(errorHandler);

export default app;

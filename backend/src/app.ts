import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { getBom, getDocuments, getMerged, postBom } from "./controllers/apiController";
import { validateBomData, validateLogin } from "./middleware/validation";
import logger from "./utils/logger";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Simple JWT auth (Advanced requirement). For demo, single user from env.
const JWT_SECRET = process.env.JWT_SECRET || "demo-secret";
const DEMO_USER = process.env.DEMO_USER || "admin";
const DEMO_PASS = process.env.DEMO_PASS || "password";

app.post("/auth/login", validateLogin, (req, res) => {
  const { username, password } = req.body;
  if (username === DEMO_USER && password === DEMO_PASS) {
    const token = jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: "2h" });
    return res.json({ token });
  }
  return res.status(401).json({ message: "Invalid credentials" });
});

function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Missing Authorization header" });
  const token = header.replace("Bearer ", "");
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

app.get("/health", (_req, res) => res.json({ ok: true }));

// Protected API routes
app.get("/bom", authenticate, getBom);
app.get("/documents", authenticate, getDocuments);
app.get("/merged", authenticate, getMerged);
app.post("/bom", authenticate, validateBomData, postBom);

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err?.stack || String(err));
  const message = /not found/i.test(String(err?.message)) ? err.message : "Internal Server Error";
  const status = /not found/i.test(String(err?.message)) ? 404 : 500;
  res.status(status).json({ message });
});

const port = Number(process.env.PORT || 4000);
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io);
io.on("connection", () => {
  logger.info("WebSocket client connected");
});

if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => {
    logger.info(`Backend listening on http://localhost:${port}`);
  });
}

export default app;



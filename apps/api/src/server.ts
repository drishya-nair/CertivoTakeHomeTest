import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { WebSocketService } from "./services/websocketService";
import logger from "./middleware/logger";

const port = Number(process.env.PORT || 4000);
const server = http.createServer(app);

// WebSocket setup
const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io);

// Initialize WebSocket service
const wsService = new WebSocketService(io);

if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => {
    logger.info(`Backend listening on http://localhost:${port}`);
  });
}

export { server, wsService };

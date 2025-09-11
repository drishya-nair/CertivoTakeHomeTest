import { Server } from "socket.io";
import logger from "../middleware/logger";

export class WebSocketService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers() {
    this.io.on("connection", (socket) => {
      logger.info(`WebSocket client connected: ${socket.id}`);
      
      socket.on("disconnect", () => {
        logger.info(`WebSocket client disconnected: ${socket.id}`);
      });
    });
  }

  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  broadcastToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }
}

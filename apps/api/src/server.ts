import http from "http";
import app from "./app";
import logger from "./lib/logger";
import env from "./config/env";

const port = env.PORT;
const server = http.createServer(app);

if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => {
    logger.info(`Backend listening on http://localhost:${port}`);
  });
}

export { server };

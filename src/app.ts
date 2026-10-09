import "dotenv/config";
import { Server } from "./server.ts";
import routes from "./routes/index.ts";

const server = new Server({
  port: Number(process.env.PORT) || 3000,
  routes,
});

server.start();
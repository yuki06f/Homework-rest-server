import "dotenv/config";
import { Server } from "./server.js";
import routes from "./routes/index.js";
const server = new Server({
    port: Number(process.env.PORT) || 3000,
    routes,
});
server.start();

import express, { Router } from "express";
export class Server {
    port;
    server;
    routes;
    constructor(options) {
        this.server = express();
        this.port = options.port;
        this.routes = options.routes;
    }
    start = () => {
        this.server.use(express.json()); // before the routes
        this.server.use("/api", this.routes);
        this.server.listen(this.port, () => {
            console.log(`server running on port: ${this.port}`);
        });
    };
}

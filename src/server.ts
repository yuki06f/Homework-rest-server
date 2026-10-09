import express, { Router, type Express, type Request, type Response, type NextFunction } from "express";

type ServerOptions = {
  port: number;
  routes: Router;
};

export class Server {
  private readonly port: number;
  private readonly server: Express;
  private readonly routes: Router;

  constructor(options: ServerOptions) {
    this.server = express();
    this.port = options.port;
    this.routes = options.routes;
  }

    public start = (): void => {
    this.server.use(express.json()); 
    this.server.use("/api", this.routes);

    //hanlder
    this.server.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
      if (error instanceof SyntaxError) {
        res.status(400).json({ message: "invalid JSON body" });
        return;
      }
      console.error("unhandled error:", error);
      res.status(500).json({ message: "internal server error" });
    });

    this.server.listen(this.port, () => {
      console.log(`server running on port: ${this.port}`);
    });
  };
}
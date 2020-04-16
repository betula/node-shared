import { default as Express } from "express";
import { default as Cors } from "cors";
import { provide } from "node-provide";
import { Logger } from "@services/Logger";

export type RequestHandler = (req: Express.Request, res: Express.Response) => Promise<any>;

export class Server {
  logger = provide(Logger);

  public express: Express.Express;
  public port!: number;
  public hostname!: string;

  constructor() {
    this.express = Express();
    this.express.use(Cors());
  }

  public configure({ port, hostname }: any) {
    this.port = port;
    this.hostname = hostname;
  }

  public run() {
    this.express.listen(this.port, this.hostname);
    this.logger.log("Server is ready");
  }

  public route(method: string, pattern: string, handler: RequestHandler) {
    (this.express as any)[method.toLowerCase()](
      pattern,
      async (req: Express.Request, res: Express.Response) => {
        this.logger.log(req.method, req.url);
        try {
          const ret = await handler(req, res);
          if (typeof ret !== "undefined") {
            res.json(ret);
          }
        } catch (err) {
          this.logger.error(err);
          res.status(500).send((err || {}).stack || String(err));
        }
      },
    );
    this.logger.log(`Route ${method} http://${this.hostname}:${this.port}${pattern} added`);
  }
}

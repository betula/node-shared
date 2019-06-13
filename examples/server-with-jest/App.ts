import { provide } from "node-provide";
import { Db } from "@services/Db";
import { Server } from "@services/Server";
import { AccountRouter } from "./AccountRouter";

export class App {
  @provide public db: Db;
  @provide public server: Server;
  @provide public accountRouter: AccountRouter;

  public async start(config: any) {
    this.configure(config);
    await this.init();
    this.run();
  }

  private configure({ db, server }: any) {
    this.db.configure(db);
    this.server.configure(server);
  }

  private async init() {
    await this.db.init();
    this.accountRouter.init();
  }

  private run() {
    this.server.run();
  }
}

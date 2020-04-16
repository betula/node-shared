import { provide } from "node-provide";
import { Logger } from "@services/Logger";

export class Db {
  logger = provide(Logger);

  configure({ url }: any) {
    this.logger.log("Configure Db service with url", url);
  }

  public async init() {
    this.logger.log("Init Db service (for example connection pool)");
  }

  public async insertOne(value: any) {
    this.logger.log("Insert value into Db", value);
  }
}

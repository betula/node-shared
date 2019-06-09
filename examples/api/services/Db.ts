import { provide } from "node-provide";
import { Logger } from "./Logger";

export class Db {
  @provide logger: Logger;

  public configure({ url }: any) {
    this.logger.log("Configure Db service with url", url);
  }

  public async init() {
    this.logger.log("Init Db service (for example connection pool)");
  }

  public async insertOne(value: any) {
    this.logger.log("Insert value into Db", value);
  }
}

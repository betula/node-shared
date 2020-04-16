import { provide } from "node-provide";
import { Logger } from "./Logger";

export class App {
  logger = provide(Logger);

  start() {
    this.logger.log("App ready");
  }
}

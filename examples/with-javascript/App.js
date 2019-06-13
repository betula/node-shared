import { provide } from "node-provide";
import { Logger } from "./Logger";

export class App {
  @provide(Logger) logger;

  start() {
    this.logger.log("App ready");
  }
}

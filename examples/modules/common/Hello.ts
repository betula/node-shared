import { provide } from "node-provide";
import { Logger } from "./Logger";

export class Hello {
  logger = provide(Logger);

  public world() {
    this.logger.log("Hello world!");
  }
}

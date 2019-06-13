import { provide } from "node-provide";
import { Logger } from "./Logger";

export class Hello {
  @provide logger: Logger;

  public world() {
    this.logger.log("Hello world!");
  }
}

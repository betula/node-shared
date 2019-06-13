import { provide } from "node-provide";
import { Hello } from "@modules/common";

export class App {
  @provide hello: Hello;

  public start() {
    this.hello.world();
  }
}

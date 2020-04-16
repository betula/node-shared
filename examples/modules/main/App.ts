import { provide } from "node-provide";
import { Hello } from "@modules/common";

export class App {
  hello = provide(Hello);

  public start() {
    this.hello.world();
  }
}

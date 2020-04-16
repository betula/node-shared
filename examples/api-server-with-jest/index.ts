import "module-alias/register";
import { provide } from "node-provide";
import { App } from "./App";
import { Logger } from "@services/Logger";

class AppRunner {
  app = provide(App);
  logger = provide(Logger);

  public start() {
    this.app.start({
      db: {
        url: "somedb://localhost:12345/dbname",
      },
      server: {
        hostname: "127.0.0.1",
        port: 8020,
      },
    })
    .catch((err) => {
      this.logger.error(err);
    });
  }
}

new AppRunner().start();

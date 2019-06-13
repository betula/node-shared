import chalk from "chalk";
import { Logger } from "@modules/common";

export class PrettyLogger extends Logger {
  log(text: string) {
    super.log(chalk.red.bgWhite.bold(text));
  }
}

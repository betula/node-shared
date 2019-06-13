import { redirect } from "node-provide";
import { Logger } from "@modules/common";
import { PrettyLogger } from "./PrettyLogger";

export { App } from "./App";

// After next line Logger will be changed to PrettyLogger in common module too
redirect(Logger, PrettyLogger);

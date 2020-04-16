import { provide } from "node-provide";
import { Server } from "@services/Server";
import { AccountApi } from "./AccountApi";

export class AccountRouter {
  server = provide(Server);
  accountApi = provide(AccountApi);

  public init() {
    this.server.route("GET", "/account/token", this.createToken);
  }

  public createToken = async () => {
    const token = await this.accountApi.createToken();
    return { token };
  }
}

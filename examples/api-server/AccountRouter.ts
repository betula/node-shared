import { provide } from "node-provide";
import { Server } from "@services/Server";
import { AccountApi } from "./AccountApi";
import { Logger } from "@services/Logger";

export class AccountRouter {
  @provide public logger: Logger;
  @provide public server: Server;
  @provide public accountApi: AccountApi;

  public init() {
    this.server.route("GET", "/account/token", this.createToken.bind(this));
    this.logger.log(`Route GET ${this.server.getPublicUrl()}/account/token added`);
  }

  public async createToken() {
    const token = await this.accountApi.createToken();
    return { token };
  }
}

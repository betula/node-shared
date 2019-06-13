import nanoid from "nanoid";
import { provide } from "node-provide";
import { Db } from "@services/Db";

export class AccountApi {
  @provide public db: Db;

  public async createToken() {
    const token = nanoid();
    await this.db.insertOne({ token });
    return token;
  }
}

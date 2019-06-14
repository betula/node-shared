import { AccountApi } from "./AccountApi";
const nanoid = require("nanoid");
jest.mock("nanoid");
jest.mock("@services/Db");

it("Should create and save account token to db", async () => {
  nanoid.mockReturnValueOnce("toKen");
  const api = new AccountApi();
  const token = await api.createToken();
  expect(token).toBe("toKen");
  expect(api.db.insertOne).toBeCalledWith({ token: "toKen" });
});

import { App } from "./App";

jest.mock("@services/Db");
jest.mock("@services/Server");
jest.mock("./AccountRouter");

it("Should work", async () => {
  const app = new App();
  await app.start({ db: "a", server: "b" });
  expect(app.db.configure).toBeCalledWith("a");
  expect(app.server.configure).toBeCalledWith("b");
  expect(app.db.init).toBeCalled();
  expect(app.accountRouter.init).toBeCalled();
  expect(app.server.run).toBeCalled();
});

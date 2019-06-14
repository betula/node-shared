import { AccountRouter } from "./AccountRouter";

jest.mock("@services/Server");
jest.mock("./AccountApi");

let router: AccountRouter;
beforeEach(() => {
  router = new AccountRouter();
});

it("Should init router", () => {
  router.init();
  expect(router.server.route).toBeCalledWith(
    "GET", "/account/token", router.createToken,
  );
});

it("Should create token", () => {
  (router.accountApi.createToken as any).mockResolvedValueOnce("toKen");
  expect(router.createToken()).resolves.toStrictEqual({ token: "toKen" });
});

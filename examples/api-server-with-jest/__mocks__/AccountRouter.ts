
export const AccountRouter = jest.fn().mockImplementation(() => ({
  init: jest.fn(),
  createToken: jest.fn(),
}));

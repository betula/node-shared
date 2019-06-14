
export const Server = jest.fn().mockImplementation(() => ({
  configure: jest.fn(),
  route: jest.fn(),
  run: jest.fn(),
}));

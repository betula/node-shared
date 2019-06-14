
export const Db = jest.fn().mockImplementation(() => ({
  configure: jest.fn(),
  init: jest.fn(),
  insertOne: jest.fn(),
}));

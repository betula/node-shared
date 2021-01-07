# node-shared

[![npm version](https://img.shields.io/npm/v/node-shared?style=flat-square)](https://www.npmjs.com/package/node-shared) [![npm bundle size](https://img.shields.io/bundlephobia/minzip/node-shared?style=flat-square)](https://bundlephobia.com/result?p=node-shared) [![typescript supported](https://img.shields.io/npm/types/typescript?style=flat-square)](./src/index.ts)

Service provider for Node.JS without pain with Dependency Injection Container, dependency registration, and configuration.

- You can use it at any place of your application without rewrite your applications architecture or other preparations or initializations.
- Each dependency can be class or function.
- You can override your dependencies for unit testing without hack standard Node.JS require mechanism.
- You can use TypeScript or JavaScript.

## Example

```javascript
import { shared } from "node-shared";

// It is can be service or shared state or cross requests data
class Users {
  async getById(id) {
    ...
  }
}

const sharedUsers = () => shared(Users);

// And with express for example
app.get("/user/:id", async (req, res) => {
  const users = sharedUsers();
  res.json(await users.getById(req.params.id));
});
```

## Unit testing

You can use `mock` to provide mocks into your dependencies.

```javascript
import { mock } from "node-shared";
import { Users, Api } from "./shareds";

test("Users service should call api service inside", async () => {
  const apiMock = mock(Api, {
    getUserById: jest.fn();
  });

  const users = new Users();

  await users.getById("John");
  expect(apiMock.getUserById).toHaveBeenCalledWith("John");
});
```

If you use Jest for unit testing you need to add some code to your `jest.config.json` file.

```javascript
// jest.config.json
{
  ...
  setupFilesAfterEnv: [
    "node-shared/jest"
  ],
  ...
}
```

This code means that after each test cached shareds instances will be clear. For another testing frameworks, you need call `free` after each test case manually for cleanup cached instances of dependencies.

```javascript
afterEach(require("node-shared").free);
```

## API Reference

**shared**

Returns instance of your dependency. Each dependency can be class or function.
- For class. The class will be instantiated once and cached
- For function. The function will be called and result cached

```javascript
const db = shared(Db);
```

**mock**

Define resolved value for any dependency.

```javascript
const mockedDb = mock(Db, {
  connect: jest.fn()
});

shared(Db).connect();
expect(mockedDb.connect).toHaveBeenCalled();
```

**free**

Clean all cached shared instances. It's needed for testing usually. Has no parameters.

```javascript
free()
```

## Install

```
npm i node-shared
```

Enjoy and Happy Coding!

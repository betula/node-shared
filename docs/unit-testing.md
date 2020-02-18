---
id: unit-testing
title: Unit testing
sidebar_label: Unit testing
---

You can use `assign` to provide mocks into your dependencies.

```typescript
// world.ts
export class World {
  hello() {
    // ...
  }
}

// hello.ts
import { provide } from "node-provide";
import { World } from "./world";

export class Hello {
  @provide world: World;

  world() {
    this.world.hello();
  }
}

// hello.test.ts
import { assign, cleanup } from "node-provide";
import { World } from "./world";
import { Hello } from "./hello";
// ...

afterEach(cleanup);

test("It works!", () => {
  const worldMock = {
    hello: jest.fn(),
  }
  assign(World, worldMock);
  new Hello().world();
  expect(worldMock.hello).toBeCalled();
})
```

If you use `Jest` for unit testing you need to add some code to your `jest.config.js` file.

```javascript
// jest.config.js
{
  // ...
  setupFilesAfterEnv: [ "node-provide/jest-cleanup-after-each" ],
  // ...
}
```

This code means that after each test cached dependency instances will be clear. For another testing frameworks, you need call `cleanup` after each test case manually for cleanup cached instances of dependencies.

```javascript
const { cleanup } = require("node-provide");
// ...
afterEach(cleanup);
// ...
```

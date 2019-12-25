![node-provide](https://betula.github.io/node-provide/img/readme-logo.svg)

[![npm version](https://badge.fury.io/js/node-provide.svg)](https://badge.fury.io/js/node-provide)
[![Build Status](https://travis-ci.org/betula/node-provide.svg?branch=master)](https://travis-ci.org/betula/node-provide)
[![Coverage Status](https://coveralls.io/repos/github/betula/node-provide/badge.svg?branch=master)](https://coveralls.io/github/betula/node-provide?branch=master)

Async context based Dependency Injection for Node.JS without pain with Dependency Injection Container, dependency registration, and configuration.

- You can use it at any place of your application without rewrite your applications architecture or other preparations or initializations.
- Each dependency can be class, function, or any another value, and plain JavaScript object too.
- You can override your dependencies for organizing modules architecture, or unit testing without hack standard Node.JS require mechanism.
- You can use TypeScript or JavaScript, with decorators.
- You can create isolate context for multiple instances of your application (Dependency Injection scopes) with a different set of dependencies, overrides, and instances.

## Install

```
npm install node-provide
```

## Some examples of different syntax in JavaScript and TypeScript

TypeScript with decorators and reflect metadata.

```typescript
import { provide } from "node-provide";
// ...

class Db { /* ... */ }
class Server { /* ... */ }
// ...

// Inject dependencies using @provide decorator and class properties
export default class App {
  @provide db: Db;
  @provide server: Server;
  // ...
  start() {
    this.db.init();
    // ...
  }
}

// index.ts
new App().start(); // You can create an instance directly as usually class
```

JavaScript with decorators.

```javascript
import { provide } from "node-provide";
// ...

// Using @provide decorator
export default class App {
  @provide(Db) db;
  @provide(Server) server;
  // ...
  start() {
    this.db.init();
    // ...
  }
}

// index.js
new App().start(); // You can create an instance directly as usually class
```

## Override dependencies

If you use modules architecture of your application you can override your dependencies.

```typescript
import { override, provide } from "node-provide";

class BaseA {
  log() {
    throw new Error("log is not implemented");
  }
}

class A {
  log() {
    console.log("Log A!");
  }
}

class B {
  @provide a: BaseA;
  log() {
    this.a.log(); // Log A!
  }
}

override(BaseA, A); // After that BaseA and A dependencies will use only one instance of A
new B().log(); // "Log A!"
```

## Unit testing

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

after(cleanup);

it("It works!", () => {
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
after(cleanup);
// ...
```

## Isolate Dependency Injection context

If you want more then one instance of your application with different configuration or with a different overrides of dependencies, you can use `zone`. It works using async context for separate Dependency Injection scopes. Node.JS async hook will be created only once after the first call of `zone`. In each of `zone` section, you can define any overrides, scopes can be nested with inherit overrides.

```typescript
import { zone, provide, resolve } from "node-provide";

class A {
  private counter: number = 0;
  inc() {
    this.counter += 1;
  }
  print() {
    console.log(`Counter ${this.counter}`);
  }
}

class B {
  @provide a: A
  incAndPrint() {
    a.inc();
    a.print();
  }
}

// Each section of `zone` use different dependency injection scopes and different instances of your dependencies
await zone(() => {
  const b = new B;
  b.incAndPrint(); // Counter 1
  b.incAndPrint(); // Counter 2
});
await zone(() => {
  const b = new B;
  b.incAndPrint(); // Counter 1
});
```

## API Reference

**resolve**

Returns instance of your dependency. Each dependency can be class, function or any value.
- For class. The class will be instantiated once and cached
- For function. The function will be called and result cached
- For any value. Return it value without any changes

```javascript
const depInstance = resolve(Dep);
```

**provide**

Property decorator for providing an instance of dependency on the class property had two overridden signatures. One of them without parameter used reflect metadata for taking dependency, next one uses dependency from parameter.

```typescript
class {
  @provide dep1: Dep1;
  @provide(Dep2): dep2;
}
```

In TypeScript exists the problem that it doesn't understand that property from non initialized has been transformed to getter. You can disable `strictPropertyInitialization` in your `tsconfig.json` or using with an exclamation mark.

```typescript
class {
  @provide dep1!: Dep1;
}
```

**override**

Override dependency.

```javascript
override(FromDep, ToDep);
// ...
console.log(resolve(FromDep) === resolve(ToDep)); // true
```

**assign**

Define any value as resolved value for any dependency.

```javascript
assign(Dep, value);
// ...
class A {}
assign(A, 10);
console.log(resolve(A)); // 10
```

**zone**

Run your app in isolated Dependency Injection scope. All instances cached for this instance application will be isolated from all cached instances in other scopes. All overrides defined here will be inherited for nested isolated scopes but not available for others. No return value.

```javascript
await zone(async () => {
  const app = new App(); // Run you app here
  await app.run();
  // ...
});
```

```javascript
await zone(async () => {
  override(Dep1, Dep2);

  await zone(async () => {
    override(Dep2, Dep3);
    // ...
    console.log(resolve(Dep1) instanceof Dep3); // true
  });
  // ...
  console.log(resolve(Dep1) instanceof Dep2); // true
})
```

**cleanup**

Clean all cached dependency instances. It's needed for testing. Has no parameters.

```javascript
// ...
after(cleanup);
// ...
```

**reset**

Clean all cached dependency instances and overrides. Has no parameters.

```javascript
reset()
```

---

If you have questions or something else for me or this project, maybe architectures questions, improvement ideas or anything else, please make the issue.

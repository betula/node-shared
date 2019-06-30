---
id: intro
title: Intro
sidebar_label: Intro
---

Async context based Dependency Injection for Node.JS without pain with Dependency Injection Container, dependency registration, and configuration.

- You can use it at any place of your application without rewrite your applications architecture or other preparations or initializations.
- Each dependency can be class, function, or any another value, and plain JavaScript object too.
- You can override your dependencies for organizing modules architecture, or unit testing without hack standard Node.JS require mechanism.
- You can use TypeScript or JavaScript, with decorators or not. Different syntaxes for one mechanism. You can use the constructor to provide dependencies or not, as you wish.
- You can create isolate context for multiple instances of your application (Dependency Injection scopes) with a different set of dependencies, overrides, and instances.

## Install

```bash
npm install node-provide
```

## Some examples of different syntax in JavaScript and TypeScript

TypeScript with decorators and reflect metadata.

```typescript
import { provide, inject } from "node-provide";
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

// or using @inject decorator and constructor parameters
@inject
export default class App {
  constructor(
    public db: Db,
    public server: Server,
  ) { /* ... */ }
  // ...
}

// index.ts
new App().start(); // You can create an instance directly as usually class
```

JavaScript with decorators.

```javascript
import { provide, inject } from "node-provide";
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

// or using @inject decorator with inject to constructor
@inject([Db, Server])
export default class App {
  constructor(db, server) { /* ... */ }
  // ...
}

// or using @inject decorator with injecting into `this`
@inject({
  db: Db,
  server: Server,
})
export default class App {
  start() {
    this.db.init();
    // ...
  }
  // ...
}

// index.js
new App().start(); // You can create an instance directly as usually class
```

Pure JavaScript without decorators.

```javascript
const { inject, attach, container } = require("node-provide");
// ...

const Db = require("./db");
const Server = require("./server");
// ...

const services = container({
  db: Db,
  server: Server,
});

// Using in function
module.exports = function() {
  return {
    start() {
      services.db.init();
      // ...
    },
    // ...
  }
}

// or using attach to `this` in the constructor
module.exports = class App {
  constructor() {
    attach(this, {
      db: Db,
      server: Server,
    });
  }
  // ...
  start() {
    this.db.init();
    // ...
  }
}

// or using inject decorator with injecting into the constructor
class App {
  constructor(db, server) { /* ... */ }
  // ...
}
module.exports = inject([Db, Server])(App);

// or using inject decorator with injecting into `this`
class App {
  start() {
    this.db.init();
    // ...
  }
  // ...
}
module.exports = inject(services)(App);

// index.js
new App().start(); // You can create an instance directly as usually class
```

## Override dependencies

If you use modules architecture of your application you can override your dependencies.

```typescript
import { override, inject } from "node-provide";

class A {
  send() {
    console.log("Hello A!");
  }
}

@inject
class B {
  constructor(private a: A) {
    // After `override(A, A2)` property `this.a` will be an instance of A2, but not A
    this.a.send();
  }
}

class A2 {
  send() {
    console.log("Hello A2!");
  }
}

override(A, A2); // After that A and A2 dependencies will use only one instance of A2
new B(); // "Hello A2!"
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
import { inject } from "node-provide";
import { World } from "./world";

@inject
export class Hello {
  constructor(world: World) {
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
  new Hello();
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

If you want more then one instance of your application with different configuration or with a different overrides of dependencies, you can use `isolate`. It works using async context for separate Dependency Injection scopes. Node.JS async hook will be created only once after the first call of `isolate`.

```typescript
import { isolate, provide } from "node-provide";

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

// Each section of `isolate` use different dependency injection scopes and different instances of your dependencies
const b1Proxy = await isolate(() => new B);
const b2Proxy = await isolate(() => new B);

// The returned object from `isolate` had some methods and properties signature but each return value wrapped to Promise
await b1Proxy.incAndPrint(); // Counter 1
await b1Proxy.incAndPrint(); // Counter 2
await b2Proxy.incAndPrint(); // Counter 1
```

In each of `isolate` section, you can define any overrides, scopes can be nested with inherit overrides.

```javascript
// config.json
{
  "text": "Hello!"
}

// config2.json
{
  "text": "Hello 2!"
}

// hello.js
const config = require("./config");

class Hello {
  constructor() {
    assign(this, { config });
  }
  echo() {
    console.log(this.config.text);
  }
}

// index.js
const { isolate, override } = require("node-provide");
// ...

(async () => {
  const hello1Proxy = await isolate(() => {
    override(config, config2); // Override `config` dependency to `config2` only for this scope
    return new Hello();
  })
  await hello1Proxy.echo(); // "Hello 2!";
  new Hello().echo(); // "Hello!"
})();
```

## API Reference

**resolve**

Returns instance of your dependency, or list of instances for an array of dependencies. Each dependency can be class, function or any value.
- For class. The class will be instantiated once and cached
- For function. The function will be called and result cached
- For any value. Return it value without any changes

```javascript
const depInstance = resolve(Dep);
const [ dep1, dep2, ... ] = resolve(Dep1, Dep2, ...);
```

**container**

Returns a plain object with instantiated values. Each argument can be the object of dependencies or result of previous `container` call. The result will be merged.

```javascript
const cont1 = container({ dep1: Dep1, dep2: Dep2, ... }, { dep3, Dep3 }, ...);
const cont2 = container({ dep4: Dep4 }, cont1, { dep5: Dep5 }, container({ dep6: Dep6 }, ...), ...);
const { dep1, dep2, dep3, dep4, dep5, dep6, ... } = cont2;
```

**inject**

Decorator to provide dependencies into object or class. If it runs without arguments it uses reflect metadata for determine list of dependencies from class constructor parameters. For TypeScript your need enable `experimentalDecorators` and `emitDecoratorMetadata` options in your `tsconfig.json`.

```typescript
@inject // or @inject() its same
class A {
  constructor(public dep1: Dep1, public dep2: Dep2, ...) {}
}
const a = new (A as new () => A); // Important: TypeScript can't understanding that constructor signature was changed after use `inject` decorator
// ...

// Or if A is dependency too you can use `resolve` to get an instance of it
const a = resolve(A);
```

If it runs with an array of dependency it works the same but without reflect metadata.

```javascript
@inject([Dep1, Dep2, Dep3, ...])
class {
  constructor(dep1, dep2, dep3, ...) {}
}
```

Or exists signature of this method same as `container`, but return decorator function with injecting all dependency instances into `prototype` if it's class, or into `this` if its plain object.

```javascript
const decorator = @inject({ dep1: Dep1 }, container({ dep2, Dep2 }), ...);
const Class = decorator(class {
  anyMethodOrConstructor() {
    const { dep1, dep2 } = this;
  }
});
const obj = decorator({
  anyMethod() {
    const { dep1, dep2 } = this;
  }
});
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

**attach**

Provide instances of dependencies into the object. Signature of function same as the `container`.

```javascript
const m = {};
const m2 = attach(m, { dep1: Dep1, ...}, container({ dep2: Dep2, ...}, ...), ...);
console.log(m === m2); // true
const dep1 = m.dep1;
const dep2 = m.dep2;
```

**bind**

Function decorator for provide container as the first parameter in the decorated function. Signature of function same as the `container`.

```javascript
const decorator = bind({ dep1: Dep1, ...}, container({ dep2: Dep2, ...}), ...);
const fn = decorator((cont, x, y) => {
  const dep1 = cont.dep1;
  const dep2 = cont.dep2;
  // ...
});
fn(x, y);
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

**isolate**

Run your app in isolated Dependency Injection scope. All instances cached for this instance application will be isolated from all cached instances in other scopes. All overrides defined here will be inherited for nested isolated scopes but not available for others. The return value can be object, function, or any other value:
- For object. All methods will be proxied and their return values converted to promises of them
- For function. The function will be proxied and return value converted to promise of it.
- For any value. Return it value without any changes

```javascript
const proxy = await isolate(() => {
  const app = new App(); // Run you app here
  // ...
  return {
    methodA() {},
    methodB() {},
    // ...
  }
});
// ...
await proxy.methodA();
await proxy.methodB();
```

```javascript
await isolate(async () => {
  override(Dep1, Dep2);

  await isolate(async () => {
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

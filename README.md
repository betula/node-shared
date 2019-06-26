# node-provide
[![npm version](https://badge.fury.io/js/node-provide.svg)](https://badge.fury.io/js/node-provide)
[![Build Status](https://travis-ci.org/betula/node-provide.svg?branch=master)](https://travis-ci.org/betula/node-provide)
[![Coverage Status](https://coveralls.io/repos/github/betula/node-provide/badge.svg?branch=master)](https://coveralls.io/github/betula/node-provide?branch=master)

Minimalistic Dependency Injection for Node.JS

- You can use it in any place of your application without rewrite your applications architecture or other preparations or initializations.
- Each dependency can be class, function, or any another value, and plain JavaScript object of cource too.
- You can override your dependencies for organize modules architecture, or unit testing without replace standart Node.JS require mechanism.
- You can use TypeScript or JavaScript, with decorators or not.
- Defferent syntaxies for one mechanism. You can use constructor for provide dependencies or not, as you wish.
- You can create isolate context for multiple instances of you application with different set of depenencies, overrides and instances.

## Install

```
npm install node-provide
```

## Some examples for different syntax in JavaScript and TypeScript.

TypeScript with decorators and reflect metadata

```TypeScript
import { provide, inject } from "node-provide";
// ...

class Db { /* ... */ }
class Server { /* ... */ }
class AccountRouter { /* ... */ }
// ...

// Inject dependencies using @provide decorator and class properties
export default class App {
  @provide db: Db;
  @provide server: Server;
  @provide accountRouter: AccountRouter;
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
    public accountRouter: AccountRouter,
  ) { /* ... */ }
  // ...
}

// index.ts
new App().start(); // You can create instance directly as usually class
```

JavaScript with decorators

```JavaScript
import { provide, inject } from "node-provide";
// ...

// Using @provide decorator
export default class App {
  @provide(Db) db;
  @provide(Server) server;
  @provide(AccountRouter) accountRouter;
  // ...
  start() {
    this.db.init();
    // ...
  }
}

// or using @inject decorator
@inject({
  db: Db,
  server: Server,
  accountRouter: AccountRouter,
})
export default class App {
  start() {
    this.db.init();
    // ...
  }
  // ...
}

// index.js
new App().start(); // You can create instance directly as usually class
```

Pure JavaScript without decorators

```JavaScript
const { inject, attach, container } = require("node-provide");
// ...

const Db = require("./db");
const Server = require("./server");
const AccountRouter = require("./account-router");
// ...

const services = container({
  db: Db,
  server: Server,
  accountRouter: AccountRouter,
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

// or using attach to `this` in constructor
module.exports = class App {
  constructor() {
    attach(this, {
      db: Db,
      server: Server,
      accountRouter: AccountRouter,
    });
  }
  // ...
  start() {
    this.db.init();
    // ...
  }
}

// or using inject decorator
class App {
  start() {
    this.db.init();
    // ...
  }
  // ...
}
module.exports = inject(services)(App);

// index.js
new App().start(); // You can create instance directly as usually class
```

## Override dependencies

If you use modules architecture of your application you can override you dependencies.

```TypeScript
import { override, inject } from "node-provide";

class A {
  send() {
    console.log("Hello A!");
  }
}

@inject
class B {
  constructor(private a: A) {
    // After `override(A, A2)` property
    // `this.a` will be instance of A2, but not A
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

You can use `override` or `assign` for provide mocks in you dependencies.

```TypeScript
import { override, inject } from "node-provide";

// world.ts
class World {
  hello() {
    // ...
  }
}

// hello.ts
@inject
class Hello {
  constructor(world: World) {
    this.world.hello();
  }
}

// hello.test.ts
it("It works!", () => {
  const worldMock = {
    hello: jest.fn(),
  }
  assign(World, worldMock);
  new Hello();
  expect(worldMock.start).toBeCalled();
})
```

If you use `Jest` for unit testing you need add some code to your `jest.config.js` file.
```JavaScript
// jest.config.js
{
  // ...
  setupFilesAfterEnv: [ "node-provide/jest-cleanup-after-each" ],
  // ...
}
```

This code means that after each test cached dependency instances will be clear.

## Isolate Dependency Injection context

If you want more then one instance of your application with different configuration on with different overrides of dependencies, you can use `isolate`. It works using async context for separate of Dependency Injection scopes.

```TypeScript
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

// Retured object from `isolate` had some methods and properties signature but each return value wrapped to Promise
await b1Proxy.incAndPrint(); // Counter 1
await b1Proxy.incAndPrint(); // Counter 2
await b2Proxy.incAndPrint(); // Counter 1
```

In each of `isolate` section you can define any overrides, scopes can be nested with inheris overrides.

```JavaScript
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

**inject**

**provide**

**resolve**

**container**

**attach**

**bind**

**override**

**assign**

**isolate**

**reset**

---

If you have questions or something else for me or this project, maybe architectures questions, improvement ideas or anything else, please make issues.

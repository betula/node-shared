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
```

## Unit testing


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


---

If you have questions or something else for me or this project, maybe architectures questions, improvement ideas or anything else, please make issues.

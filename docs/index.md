---
id: index
title: Getting Started
sidebar_label: Getting Started
---

Async context based Dependency Injection for Node.JS without pain with Dependency Injection Container, dependency registration, and configuration.

<!--DOCUSAURUS_CODE_TABS-->

<!--TypeScript with decorators-->

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

<!--JavaScript with decorators-->

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

<!--Pure JavaScript-->

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

<!--END_DOCUSAURUS_CODE_TABS-->


- You can use it at any place of your application without rewrite your applications architecture or other preparations or initializations.
- Each dependency can be class, function, or any another value, and plain JavaScript object too.
- You can override your dependencies for organizing modules architecture, or unit testing without hack standard Node.JS require mechanism.
- You can use TypeScript or JavaScript, with decorators or not. Different syntaxes for one mechanism. You can use the constructor to provide dependencies or not, as you wish.
- You can create isolate context for multiple instances of your application (Dependency Injection scopes) with a different set of dependencies, overrides, and instances.

If you have questions or something else for me or this project, maybe architectures questions or improvement ideas, please make the issue in github.

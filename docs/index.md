---
id: index
title: Getting Started
sidebar_label: Getting Started
---

Async context based Dependency Injection for Node.JS without pain with Dependency Injection Container, dependency registration, and configuration.

<!--DOCUSAURUS_CODE_TABS-->

<!--TypeScript with decorators-->

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

<!--JavaScript with decorators-->

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

<!--END_DOCUSAURUS_CODE_TABS-->


- You can use it at any place of your application without rewrite your applications architecture or other preparations or initializations.
- Each dependency can be class, function, or any another value, and plain JavaScript object too.
- You can override your dependencies for organizing modules architecture, or unit testing without hack standard Node.JS require mechanism.
- You can use TypeScript or JavaScript, with decorators.
- You can create isolate context for multiple instances of your application (Dependency Injection scopes) with a different set of dependencies, overrides, and instances.

If you have questions or something else for me or this project, maybe architectures questions or improvement ideas, please make the issue in github.

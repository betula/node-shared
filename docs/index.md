---
id: index
title: Getting Started
sidebar_label: Getting Started
---

Async context based Dependency Injection for Node.JS without pain with Dependency Injection Container, dependency registration, and configuration.

```javascript
import { provide } from "node-provide";
// ...

class Db { /* ... */ }
class Server { /* ... */ }
// ...

// Inject dependencies using @provide decorator and class properties
export default class App {
  db = provide(Db);
  server = provide(Server);
  // ...
  start() {
    this.db.init();
    // ...
  }
}

// index.ts
new App().start(); // You can create an instance directly as usually class
```

- You can use it at any place of your application without rewrite your applications architecture or other preparations or initializations.
- Each dependency can be class, function, or any another value, and plain JavaScript object too.
- You can override your dependencies for organizing modules architecture, or unit testing without hack standard Node.JS require mechanism.
- You can use TypeScript or JavaScript.
- You can create isolate context for multiple instances of your application (Dependency Injection scopes) with a different set of dependencies, overrides, and instances.

If you have questions or something else for me or this project, maybe architectures questions or improvement ideas, please make the issue in github.

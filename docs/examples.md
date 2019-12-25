---
id: examples
title: Some examples of different syntax in JavaScript and TypeScript
sidebar_label: Examples
---

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

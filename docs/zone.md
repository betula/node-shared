---
id: zone
title: Isolate Dependency Injection context
sidebar_label: Zone
---

If you want more then one instance of your application with different configuration or with a different overrides of dependencies, you can use `zone`. It works using async context for separate Dependency Injection scopes. Node.JS async hook will be created only once after the first call of `zone`.

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

In each of `zone` section, you can define any overrides, scopes can be nested with inherit overrides.

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
const attach = require("node-provide").attach;
const config = require("./config");

class Hello {
  constructor() {
    attach(this, { config });
  }
  echo() {
    console.log(this.config.text);
  }
}

// index.js
const { zone, override } = require("node-provide");
// ...

(async () => {
  await zone(() => {
    override(config, config2); // Override `config` dependency to `config2` only for this scope
    new Hello().echo(); // "Hello 2!";
  })
  new Hello().echo(); // "Hello!"
})();
```

---
id: isolate
title: Isolate Dependency Injection context
sidebar_label: Isolate
---

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

---
id: zone
title: Isolate Dependency Injection context
sidebar_label: Zone
---

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

---
id: overrides
title: Override dependencies
sidebar_label: Overrides
---

If you use modules architecture of your application you can override your dependencies.

```typescript
import { override, provide } from "node-provide";

class BaseA {
  log() {
    throw new Error("log is not implemented");
  }
}

class A {
  log() {
    console.log("Log A!");
  }
}

class B {
  @provide a: BaseA;
  log() {
    this.a.log(); // Log A!
  }
}

override(BaseA, A); // After that BaseA and A dependencies will use only one instance of A
new B().log(); // "Log A!"
```

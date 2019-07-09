---
id: overrides
title: Override dependencies
sidebar_label: Overrides
---

If you use modules architecture of your application you can override your dependencies.

```typescript
import { override, inject } from "node-provide";

class A {
  send() {
    console.log("Hello A!");
  }
}

@inject
class B {
  constructor(private a: A) {
    // After `override(A, A2)` property `this.a` will be an instance of A2, but not A
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

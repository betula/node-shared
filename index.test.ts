import { instances, overrides, provide, resolve, override, reset } from "./index";

afterEach(reset);

test("Should be only one instance of provided class", () => {
  class A {
    value = "value";
  }
  class B {
    @provide a: A;
  }
  class C {
    @provide a: A;
  }
  const b = new B();
  const c = new C();
  expect(b.a.value).toBe("value");
  expect(c.a).toBe(b.a);
  expect(instances.size).toBe(1);
});

test("Should make instance of class only on demand", () => {
  class A {
    method() {}
  }
  class B {
    @provide a: A;
  }
  const b = new B();
  expect(instances.size).toBe(0);
  expect(typeof b.a.method).toBe("function");
  expect(instances.size).toBe(1);
});

test("Should cache getter after first use", () => {
  class A {}
  class B {
    @provide a: A;
  }
  const b = new B();
  const a = b.a;
  instances.clear();
  expect(instances.size).toBe(0);
  expect(b.a).toBe(a);
  expect(instances.size).toBe(0);
});

test("Should work through resolve function", () => {
  class A {}
  class B {
    @provide a: A;
  }
  const b = new B();
  expect(resolve(A)).toBe(b.a);
});

test("Should work with override", () => {
  class A {}
  class A2 extends A {}
  class B {
    @provide a: A;
  }
  override(A, A2);
  expect(overrides.size).toBe(1);
  expect(resolve(B).a).toBeInstanceOf(A2);
});

test("Should cache override", () => {
  class A {}
  class A2 extends A {}
  class A3 extends A2 {}
  class B {
    @provide a: A;
  }
  override([A, A2], [A2, A3]);
  expect(overrides.size).toBe(2);
  expect(resolve(B).a).toBeInstanceOf(A3);
  expect(instances.get(A)).toBeInstanceOf(A3);
  expect(instances.get(A2)).toBeInstanceOf(A3);
});

test("Should work reset", () => {
  class A {}
  class A2 extends A {}
  override(A, A2);
  expect(resolve(A)).toBe(resolve(A2));
  expect(instances.size).toBe(2);
  expect(overrides.size).toBe(1);
  reset();
  expect(instances.size).toBe(0);
  expect(overrides.size).toBe(0);
});

test("Should work with JS semantic", () => {
  class A {}
  class B {
    @provide(A) a: A;
  }
  expect(resolve(B).a).toBeInstanceOf(A);
});

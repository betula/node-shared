import {
  instances,
  overrides,
  provide,
  resolve,
  override,
  container,
  attach,
  reset,
  RootZoneId,
} from "./index";

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
  expect(instances[RootZoneId].size).toBe(1);
});

test("Should make instance of class only on demand", () => {
  class A {
    method() {}
  }
  class B {
    @provide a: A;
  }
  const b = new B();
  expect(instances[RootZoneId]).toBeUndefined();
  expect(typeof b.a.method).toBe("function");
  expect(instances[RootZoneId].size).toBe(1);
});

test("Should cache getter after first use", () => {
  class A {}
  class B {
    @provide a: A;
  }
  const b = new B();
  const a = b.a;
  instances[RootZoneId].clear();
  expect(instances[RootZoneId].size).toBe(0);
  expect(b.a).toBe(a);
  expect(instances[RootZoneId].size).toBe(0);
});

test("Should work resolve function", () => {
  class A {}
  class B {}
  class C {
    @provide a: A;
    @provide b: B;
  }
  const c = new C();
  expect(resolve(A)).toBe(c.a);
  const [a, b] = resolve(A, B);
  expect(a).toBe(c.a);
  expect(b).toBe(c.b);
});

test("Should work with override", () => {
  class A {}
  class A2 extends A {}
  class B {
    @provide a: A;
  }
  override(A, A2);
  expect(overrides[RootZoneId].size).toBe(1);
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
  expect(overrides[RootZoneId].size).toBe(2);
  expect(resolve(B).a).toBeInstanceOf(A3);
  expect(instances[RootZoneId].get(A)).toBeInstanceOf(A3);
  expect(instances[RootZoneId].get(A2)).toBeInstanceOf(A3);
});

test("Should work reset", () => {
  class A {}
  class A2 extends A {}
  override(A, A2);
  expect(resolve(A)).toBe(resolve(A2));
  expect(instances[RootZoneId].size).toBe(2);
  expect(overrides[RootZoneId].size).toBe(1);
  reset();
  expect(instances[RootZoneId]).toBeUndefined();
  expect(overrides[RootZoneId]).toBeUndefined();
});

test("Should work with JS semantic", () => {
  class A {}
  class B {
    @provide(A) a: A;
  }
  expect(resolve(B).a).toBeInstanceOf(A);
});

test("Should work container function", () => {
  class A {}
  class B {}
  class C {}
  const m = container({ a: A }, container({ b: B }), { c: C });
  expect(m.a).toBeInstanceOf(A);
  expect(m.b).toBeInstanceOf(B);
  expect(m.c).toBeInstanceOf(C);
});

test("Should work attach function", () => {
  class A {}
  class B {}
  class C {}
  const p = {};
  const m = attach(p, { a: A, b: B }, container({ c: C }));
  expect(m).toBe(p);
  expect(m.a).toBeInstanceOf(A);
  expect(m.b).toBeInstanceOf(B);
  expect(m.c).toBeInstanceOf(C);
});

test("Should cache getters in attach", () => {
  class A {}
  const m = attach({}, { a: A });
  const a = m.a;
  instances[RootZoneId].clear();
  expect(instances[RootZoneId].size).toBe(0);
  expect(m.a).toBe(a);
  expect(instances[RootZoneId].size).toBe(0);
});

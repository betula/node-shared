import {
  instances,
  overrides,
  provide,
  resolve,
  override,
  zone,
  assign,
  reset,
  cleanup,
  getZoneId,
  RootZoneId,
  zoneIndex,
  zoneParentIndex,
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
  const [a, b] = [A, B].map(resolve);
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
  override(A, A2);
  override(A2, A3);
  expect(overrides[RootZoneId].size).toBe(2);
  expect(resolve(B).a).toBeInstanceOf(A3);
  expect(instances[RootZoneId].get(A)).toBeInstanceOf(A3);
  expect(instances[RootZoneId].get(A2)).toBeInstanceOf(A3);
});

test("Should work cleanup", () => {
  class A {}
  class B {}
  const m = {};
  expect(resolve(A)).toBeInstanceOf(A);
  assign(B, m);
  expect(resolve(B)).toBe(m);
  expect(instances[RootZoneId].size).toBe(2);
  cleanup();
  expect(instances[RootZoneId]).toBeUndefined();
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

test("should work resolve with plain values", () => {
  const d = new Date();
  const c = {};
  expect(resolve(null)).toBe(null);
  expect(resolve("hello")).toBe("hello");
  expect(resolve(10)).toBe(10);
  expect(resolve(d)).toBe(d);
  expect(resolve(c)).toBe(c);
});

test("Should work assign", () => {
  class A {}
  class B {}
  class C {}
  class D {}
  class E {}
  const j = {};
  override(A, B);
  assign(A, j);
  assign(E, 10);
  expect(resolve(E)).toBe(10);
  const [a, b] = [A, B].map(resolve);
  expect(a).toBe(j);
  expect(b).toBe(j);
});

test("Should work nested zone", async () => {
  const spy = jest.fn();
  class A {};
  class B {};
  class C {};
  class D {};

  await zone(async () => {
    override(A, B);
    await zone(async () => {
      override(B, C);
      await zone(async () => {
        override(C, D);
        expect(resolve(A)).toBeInstanceOf(D);
        spy();
      });
      expect(resolve(A)).toBeInstanceOf(C);
      spy();
    });
    expect(resolve(A)).toBeInstanceOf(B);
    spy();
  });
  expect(resolve(A)).toBeInstanceOf(A);
  expect(spy).toBeCalledTimes(3);
});

test("Should work zone with local override", async () => {
  const spyF = jest.fn().mockReturnValueOnce(1).mockReturnValueOnce(2);
  const F = () => spyF();
  class A {
    @provide(F) f: number;
    getF() {
      return this.f;
    }
  }
  class B extends A {
    getF() {
      return super.getF() + 10;
    }
  }
  await zone(() => {
    override(A, B);
    const a = resolve(A);
    expect(a).toBeInstanceOf(B);
    expect(a.getF()).toBe(11);
  });
  const a = resolve(A);
  expect(a).toBeInstanceOf(A);
  expect(a.f).toBe(2);
  expect(spyF).toBeCalledTimes(2);
});

test("Should throw error in zone", async () => {
  await expect(zone(() => { throw new Error("A"); })).rejects.toThrow("A");
});

test("Should work getting current zone id", async () => {
  expect(getZoneId()).toBe(RootZoneId);
  let z1: number;
  await zone(() => { z1 = getZoneId() });
  expect(z1).not.toBe(RootZoneId);
  let z2: number;
  await zone(() => { z2 = getZoneId() });
  expect(z2).not.toBe(RootZoneId);
  expect(z2).not.toBe(z1);
});

test("Should destroy async context in zone", async () => {
  let zoneId = getZoneId();
  let isolateZoneId: number;
  const spy = jest.fn();
  await zone(() => {
    isolateZoneId = getZoneId();
    expect(zoneIndex[isolateZoneId]).toBe(isolateZoneId);
    expect(zoneParentIndex[isolateZoneId]).toBe(zoneId);
    spy();
  });
  const currentZoneId = getZoneId();
  expect(currentZoneId).toBe(zoneId);
  expect(zoneId).not.toBe(isolateZoneId);
  expect(zoneParentIndex[isolateZoneId]).toBeUndefined();
  await new Promise(setTimeout as any);
  expect(zoneIndex[isolateZoneId]).toBeUndefined();
  expect(spy).toBeCalled();
});

test("Should throw error when circular dependency detected", () => {
  class A {
    @provide(func) f: A;
    action() {}
    constructor() {
      this.f.action();
    }
  }
  function func() {
    return resolve(A);
  }
  expect(() => resolve(A)).toThrow("Circular dependency detected");
});

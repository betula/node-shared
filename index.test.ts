import {
  instances,
  overrides,
  provide,
  resolve,
  override,
  container,
  attach,
  bind,
  isolate,
  assign,
  inject,
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

test("Should work container function", () => {
  class A {}
  class B {}
  class C {}
  const F = (): { n: number } => ({ n: 10 });
  const F2 = function () { return { m: 11 }; };
  const m = container({ a: A }, container({ b: B }), { c: C, f: F });
  const p = container(m, { k: "K" }, container({ f2: F2 }));
  expect(m.a).toBeInstanceOf(A);
  expect(m.b).toBeInstanceOf(B);
  expect(m.c).toBeInstanceOf(C);
  expect(p.f.n).toBe(10);
  expect(p.f2.m).toBe(11);
  expect(p.k).toBe("K");
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

test("Should work resolve with multiple dependencies", () => {
  class A {}
  const F = () => 10;
  const J = {};
  const [a, f, j] = resolve(A, F, J);
  expect(a).toBeInstanceOf(A);
  expect(f).toBe(10);
  expect(j).toBe(J);
  expect(resolve()).toBeUndefined();
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

test("Should work bind", () => {
  class A {}
  const F = () => 10;
  const J = {};
  const spy = jest.fn();
  const func = bind({ j: J }, container({ a: A, f: F }))((cont, x1, x2) => {
    expect(cont.j).toBe(J);
    expect(cont.a).toBeInstanceOf(A);
    expect(cont.f).toBe(10);
    expect(x1).toBe(true);
    expect(x2).toBe("X");
    spy();
  });
  expect(typeof func).toBe("function");
  func(true, "X");
  expect(spy).toBeCalled();
});

test("Should work inject with dependecies for class", () => {
  const spyF = jest.fn().mockReturnValue({ v: 11 });
  const F = () => spyF();
  class A {}
  const spyM = jest.fn();
  const spyC = jest.fn();
  const dec = inject({ a: A }, container({ f: F }));
  expect(typeof dec).toBe("function");
  class M {
    f: any;
    a: any;
    method() {
      expect(this.f.v).toBe(11);
      expect(this.a).toBeInstanceOf(A);
      spyM();
    }
    constructor(x1: string, x2: number) {
      expect(x1).toBe("x1");
      expect(x2).toBe(8);
      expect(this.f.v).toBe(11);
      expect(this.a).toBeInstanceOf(A);
      spyC();
    }
  }
  const cls = dec(M);
  expect(cls).toBe(M);
  const c = new cls("x1", 8);
  expect(spyC).toBeCalledTimes(1);
  c.method();
  expect(spyM).toBeCalledTimes(1);
  expect(spyF).toBeCalledTimes(1);
});

test("Should work inject with dependencies for plain objects", () => {
  class A { a = "a"; }
  class B { b = "b"; }
  const dec = inject({ a: A }, container({ b: B }));
  const c = dec({
    c: 10,
    getA(this: any) {
      return this.a.a;
    },
  });
  expect(c.a.a).toBe("a");
  expect(c.b.b).toBe("b");
  expect(c.c).toBe(10);
  expect(c.getA()).toBe("a");
});

test("Should work inject as decorator without parameters", () => {
  class A { a = "a"; }
  @inject()
  class B {
    constructor(public a: A) {}
  }
  @inject
  class C {
    constructor(public a: A, public b: B) {}
  }
  @inject
  class Z {}
  const b = resolve(B);
  const c = resolve(C);
  expect(b.a).toBeInstanceOf(A);
  expect(c.a).toBe(b.a);
  expect(c.b).toBe(b);
  expect(c.b.a.a).toBe("a");
  expect(new Z).toBeInstanceOf(Z);
});

test("Should work inject with dependencies configs in arguments", () => {
  const spy = jest.fn();
  const F = () => ({ n: 10 });
  @inject({ f: F })
  class A {
    constructor() {
      expect((this as any).f.n).toBe(10);
      spy();
    }
  }
  new A();
  expect(spy).toBeCalled();
});

test("Should woth inject with array of dependencies in argument", () => {
  const spy = jest.fn();
  class A { s = "s"; }
  const F = () => ({ n: 10 });
  @inject([A, F])
  class B {
    constructor(a: any, f: any) {
      expect(a.s).toBe("s");
      expect(f.n).toBe(10);
      spy();
    }
  }
  new (B as any)();
  expect(spy).toBeCalled();
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
  assign([C, { v: "C" }], [D, { v: "D" }]);
  assign(E, 10);
  expect(resolve(E)).toBe(10);
  const [a, b, c, d] = resolve(A, B, C, D);
  expect(a).toBe(j);
  expect(b).toBe(j);
  expect((c as any).v).toBe("C");
  expect((d as any).v).toBe("D");
});

test("Should work isolate", async () => {
  const spyA = jest.fn();
  class A {
    s: string;
    constructor() {
      spyA();
    }
  }
  const spyB = jest.fn();
  class B {
    n: number;
    @provide a: A;
    constructor(n: number, s: string) {
      this.a.s = s;
      this.n = n;
      spyB();
    }
    getS() { return this.a.s; }
    getN() { return this.n; }
  }
  const b1 = await isolate(() => new B(10, "11"));
  const b2 = await isolate(() => new B(12, "13"));
  expect(spyA).toBeCalledTimes(2);
  expect(spyB).toBeCalledTimes(2);
  expect(b1).not.toBe(b2);
  expect(b1).not.toBeInstanceOf(B);
  expect(await b1.getN()).toBe(10);
  expect(await b1.getS()).toBe("11");
  expect(b2).not.toBeInstanceOf(B);
  expect(await b2.getN()).toBe(12);
  expect(await b2.getS()).toBe("13");
});

test("Should work isolate with local override", async () => {
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
  const ai = await isolate(() => {
    override(A, B);
    return resolve(A);
  });
  const a = resolve(A);
  expect(a).toBeInstanceOf(A);
  expect(a.f).toBe(1);
  expect(await ai.getF()).toBe(12);
  expect(spyF).toBeCalledTimes(2);
});

test("Should work isolate proxy", async () => {
  class A { def = "default"; am() { return "a"; } }
  class B extends A { bm() { return "b"; } }
  expect((await isolate(() => new B())).am()).resolves.toBe("a");
  expect((await isolate(() => new B())).bm()).resolves.toBe("b");
  expect((await isolate(() => new B())).def).toBe("default");
  expect((await isolate(() => ({ am() { return "om"; } }))).am()).resolves.toBe("om");
  expect((await isolate(() => ({ am() { return "om"; }, k: 11 }))).k).toBe(11);
  expect((await isolate(() => [(():number => 0), 11]))[0]()).resolves.toBe(0);
  expect((await isolate(() => [(():number => 0), 11]))[1]).toBe(11);
  expect((await isolate(() => () => 0))()).resolves.toBe(0);
  expect(isolate(() => 10)).resolves.toBe(10);
  expect(isolate(() => null)).resolves.toBe(null);
  expect(isolate(() => "hello")).resolves.toBe("hello");
  expect(isolate(() => undefined)).resolves.toBe(undefined);
  expect(isolate(() => new Date())).resolves.toBeInstanceOf(Date);
  expect(isolate(() => new Map())).resolves.toBeInstanceOf(Map);
  expect(isolate(() => new WeakMap())).resolves.toBeInstanceOf(WeakMap);
  expect(isolate(() => new WeakSet())).resolves.toBeInstanceOf(WeakSet);
  expect(isolate(() => new Error())).resolves.toBeInstanceOf(Error);
});

test("Should throw error in isolate", async () => {
  await expect(isolate(() => { throw new Error("A"); })).rejects.toThrow("A");
});

test("Should throw error in isolate proxy", async () => {
  const proxy = await isolate(() => {
    return {
      mtd():void { throw new Error("Mtd"); },
    };
  });
  await expect(proxy.mtd()).rejects.toThrow("Mtd");
});

test("Should work getting current zone id", async () => {
  expect(getZoneId()).toBe(RootZoneId);
  const z1 = await isolate(getZoneId);
  expect(z1).not.toBe(RootZoneId);
  const z2 = await isolate(getZoneId);
  expect(z2).not.toBe(RootZoneId);
  expect(z2).not.toBe(z1);
});

test("Should destroy async context in isolate", async () => {
  const getIsolateZoneId = await isolate(() => getZoneId);
  const isolateZoneId = await getIsolateZoneId();
  const zoneId = getZoneId();
  expect(zoneId).not.toBe(isolateZoneId);
  expect(zoneIndex[isolateZoneId]).toBe(isolateZoneId);
  expect(zoneParentIndex[isolateZoneId]).toBe(zoneId);
  await new Promise(setTimeout as any);
  expect(zoneIndex[isolateZoneId]).toBeUndefined();
  expect(zoneParentIndex[isolateZoneId]).toBeUndefined();
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

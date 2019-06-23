import async_hooks, { AsyncHook } from "async_hooks";
import "reflect-metadata";

type ObjectMap<T = any> = {
  [key: string]: T;
};

type Dep<T = any> = (new () => T) | (() => T) | T;
enum DepResolvePhase {
  Start,
  Finish,
}

export const instances: ObjectMap<Map<Dep, any>> = {};
export const overrides: ObjectMap<Map<Dep, any>> = {};
export const resolvePhases: ObjectMap<Map<Dep, DepResolvePhase>> = {};

export const RootZoneId = 0;
let zoneId: number = RootZoneId;

export function getZoneId(): number {
  return zoneId;
}

const zoneAsyncIndex: ObjectMap<number> = {};
const zoneParentIndex: ObjectMap<number> = {};
let hook: AsyncHook;

type ProxyFunction<T> = T extends (...args: infer A) => infer R
  ? R extends Promise<any>
    ? T
    : (...args: A) => Promise<R>
  : never;
type ProxyObject<T> = {
  readonly [P in keyof T]: T[P] extends Function
    ? ProxyFunction<T[P]>
    : T[P]
};
type Proxy<T> = T extends Function
  ? ProxyFunction<T>
  : T extends any[]
    ? any[]
    : T extends object
      ? ProxyObject<T>
      : T;

export function isolate<T = void>(callback: () => T): Promise<Proxy<T>> {
  if (typeof hook === "undefined") {
    hook = async_hooks.createHook({
      init(asyncId: number, type: any, triggerAsyncId: number) {
        const rootAsyncId = zoneAsyncIndex[triggerAsyncId];
        rootAsyncId && (zoneAsyncIndex[asyncId] = rootAsyncId);
      },
      before(asyncId: number) {
        zoneId = zoneAsyncIndex[asyncId] || RootZoneId;
      },
      destroy(asyncId: number) {
        /* istanbul ignore next */
        delete zoneAsyncIndex[asyncId];
      },
    }).enable();
  }
  return new Promise((resolve, reject) => {
    process.nextTick(async () => {
      const asyncId = async_hooks.executionAsyncId();
      zoneParentIndex[asyncId] = zoneAsyncIndex[asyncId] || RootZoneId;
      zoneId = zoneAsyncIndex[asyncId] = asyncId;
      try {
        resolve(proxify(await callback()));
      } catch (error) {
        reject(error);
      }
    });
  });
}

type DepsConfig<T> = {
  [P in keyof T]: Dep<T[P]>;
};
type Deps = {
  [key: string]: any;
};
type MoreDepsConfig = {
  [key: string]: any;
};
class Container {}

export function container<T0 extends Deps>(...configs: [DepsConfig<T0>]): T0;
export function container<T0 extends Deps, T1 extends Deps>(...configs: [DepsConfig<T0>, DepsConfig<T1>]): T0 & T1;
export function container<T0 extends Deps, T1 extends Deps, T2 extends Deps>(...configs: [DepsConfig<T0>, DepsConfig<T1>, DepsConfig<T2>]): T0 & T1 & T2;
export function container<T0 extends Deps, T1 extends Deps, T2 extends Deps, T3 extends Deps>(...configs: [DepsConfig<T0>, DepsConfig<T1>, DepsConfig<T2>, DepsConfig<T3>]): T0 & T1 & T2 & T3;
export function container<T0 extends Deps, T1 extends Deps, T2 extends Deps, T3 extends Deps, T4 extends Deps>(...configs: [DepsConfig<T0>, DepsConfig<T1>, DepsConfig<T2>, DepsConfig<T3>, DepsConfig<T4>, ...MoreDepsConfig[]]): T0 & T1 & T2 & T3 & T4;
export function container(...configs: any[]) {
  const propDescriptors: any = {};
  configs.forEach((options: any) => {
    const isContainer = options instanceof Container;
    Object.keys(options).forEach((key) => {
      let get;
      if (isContainer) {
        get = Object.getOwnPropertyDescriptor(options, key)!.get;
      } else {
        const val = options[key];
        if (typeof val === "function") {
          get = () => resolve(val);
        } else {
          get = () => val;
        }
      }
      propDescriptors[key] = {
        get,
        enumerable: true,
        configurable: true,
      };
    });
  });
  const cont = new Container();
  Object.defineProperties(cont, propDescriptors);
  return cont;
}

type PropertyKey = string | symbol;
type ClassType<T, K extends any[]> = new (...args: K) => T;
type ProvideClassDecRetFn<T> = <P, M extends any[]>(Class: ClassType<P, M>) => ClassType<P & T, M>;

export function provide(target: object, propertyKey: PropertyKey): any;
export function provide(dep: Dep): (target: object, propertyKey: PropertyKey) => any;
export function provide<T0 extends Deps>(...configs: [DepsConfig<T0>]): ProvideClassDecRetFn<T0>;
export function provide<T0 extends Deps, T1 extends Deps>(...configs: [DepsConfig<T0>, DepsConfig<T1>]): ProvideClassDecRetFn<T0 & T1>;
export function provide<T0 extends Deps, T1 extends Deps, T2 extends Deps>(...configs: [DepsConfig<T0>, DepsConfig<T1>, DepsConfig<T2>]): ProvideClassDecRetFn<T0 & T1 & T2>;
export function provide<T0 extends Deps, T1 extends Deps, T2 extends Deps, T3 extends Deps>(...configs: [DepsConfig<T0>, DepsConfig<T1>, DepsConfig<T2>, DepsConfig<T3>]): ProvideClassDecRetFn<T0 & T1 & T2 & T3>;
export function provide<T0 extends Deps, T1 extends Deps, T2 extends Deps, T3 extends Deps, T4 extends Deps>(...configs: [DepsConfig<T0>, DepsConfig<T1>, DepsConfig<T2>, DepsConfig<T3>, DepsConfig<T4>, ...MoreDepsConfig[]]): ProvideClassDecRetFn<T0 & T1 & T2 & T3 & T4>;
export function provide(targetOrDepOrConfigs: any, propertyKey?: any): any {
  if (typeof targetOrDepOrConfigs === "function") {
    const dep = targetOrDepOrConfigs;
    return (target: object, propertyKey: PropertyKey): any => (
      createProvideDescriptor(dep as Dep, propertyKey)
    );
  }
  if (typeof propertyKey === "undefined" || typeof propertyKey === "object") {
    return (Class: any) => {
      (attach as any)(Class.prototype, ...Array.prototype.slice.call(arguments));
      return Class;
    };
  }
  return createProvideDescriptor(
    Reflect.getMetadata("design:type", targetOrDepOrConfigs, propertyKey!),
    propertyKey!,
  );
}

export function attach<Y extends object, T0 extends Deps>(target: Y, ...configs: [DepsConfig<T0>]): Y & T0;
export function attach<Y extends object, T0 extends Deps, T1 extends Deps>(target: Y, ...configs: [DepsConfig<T0>, DepsConfig<T1>]): Y & T0 & T1;
export function attach<Y extends object, T0 extends Deps, T1 extends Deps, T2 extends Deps>(target: Y, ...configs: [DepsConfig<T0>, DepsConfig<T1>, DepsConfig<T2>]): Y & T0 & T1 & T2;
export function attach<Y extends object, T0 extends Deps, T1 extends Deps, T2 extends Deps, T3 extends Deps>(target: Y, ...configs: [DepsConfig<T0>, DepsConfig<T1>, DepsConfig<T2>, DepsConfig<T3>]): Y & T0 & T1 & T2 & T3;
export function attach<Y extends object, T0 extends Deps, T1 extends Deps, T2 extends Deps, T3 extends Deps, T4 extends Deps>(target: Y, ...configs: [DepsConfig<T0>, DepsConfig<T1>, DepsConfig<T2>, DepsConfig<T3>, DepsConfig<T4>, ...MoreDepsConfig[]]): Y & T0 & T1 & T2 & T3 & T4;
export function attach(target: any, ...configs: any[]) {
  const cont = (container as any)(...configs);
  const containerDescriptors = Object.getOwnPropertyDescriptors(cont);
  Object.keys(containerDescriptors).forEach((key) => {
    Object.defineProperty(target, key, {
      get() {
        const instance = containerDescriptors[key].get!();
        Object.defineProperty(this, key, {
          value: instance,
          enumerable: true,
          configurable: false,
          writable: false,
        });
        return instance;
      },
      enumerable: true,
      configurable: true,
    });
  });
  return target;
}

type BindDecRetFn<T> = <M extends any[], P>(func: (cont: T, ...args: M) => P) => ((...args: M) => P);

export function bind<T0 extends Deps>(...configs: [DepsConfig<T0>]): BindDecRetFn<T0>;
export function bind<T0 extends Deps, T1 extends Deps>(...configs: [DepsConfig<T0>, DepsConfig<T1>]): BindDecRetFn<T0 & T1>;
export function bind<T0 extends Deps, T1 extends Deps, T2 extends Deps>(...configs: [DepsConfig<T0>, DepsConfig<T1>, DepsConfig<T2>]): BindDecRetFn<T0 & T1 & T2>;
export function bind<T0 extends Deps, T1 extends Deps, T2 extends Deps, T3 extends Deps>(...configs: [DepsConfig<T0>, DepsConfig<T1>, DepsConfig<T2>, DepsConfig<T3>]): BindDecRetFn<T0 & T1 & T2 & T3>;
export function bind<T0 extends Deps, T1 extends Deps, T2 extends Deps, T3 extends Deps, T4 extends Deps>(...configs: [DepsConfig<T0>, DepsConfig<T1>, DepsConfig<T2>, DepsConfig<T3>, DepsConfig<T4>, ...MoreDepsConfig[]]): BindDecRetFn<T0 & T1 & T2 & T3 & T4>;
export function bind(...configs: any[]) {
  const cont = (container as any)(...configs);
  return (func: any) => {
    return function (this: any, ...args: any[]): any {
      return func.call(this, cont, ...args);
    };
  };
}

export function resolve<T0>(...deps: [Dep<T0>]): T0;
export function resolve<T0, T1>(...deps: [Dep<T0>, Dep<T1>]): [T0, T1];
export function resolve<T0, T1, T2>(...deps: [Dep<T0>, Dep<T1>, Dep<T2>]): [T0, T1, T2];
export function resolve<T0, T1, T2, T3>(...deps: [Dep<T0>, Dep<T1>, Dep<T2>, Dep<T3>]): [T0, T1, T2, T3];
export function resolve<T0, T1, T2, T3, T4>(...deps: [Dep<T0>, Dep<T1>, Dep<T2>, Dep<T3>, Dep<T4>]): [T0, T1, T2, T3, T4];
export function resolve<T0, T1, T2, T3, T4, T5>(...deps: [Dep<T0>, Dep<T1>, Dep<T2>, Dep<T3>, Dep<T4>, Dep<T5>]): [T0, T1, T2, T3, T4, T5];
export function resolve<T0, T1, T2, T3, T4, T5, T6>(...deps: [Dep<T0>, Dep<T1>, Dep<T2>, Dep<T3>, Dep<T4>, Dep<T5>, Dep<T6>]): [T0, T1, T2, T3, T4, T5, T6];
export function resolve<T0, T1, T2, T3, T4, T5, T6, T7>(...deps: [Dep<T0>, Dep<T1>, Dep<T2>, Dep<T3>, Dep<T4>, Dep<T5>, Dep<T6>, Dep<T7>]): [T0, T1, T2, T3, T4, T5, T6, T7];
export function resolve<T0, T1, T2, T3, T4, T5, T6, T7, T8>(...deps: [Dep<T0>, Dep<T1>, Dep<T2>, Dep<T3>, Dep<T4>, Dep<T5>, Dep<T6>, Dep<T7>, Dep<T8>]): [T0, T1, T2, T3, T4, T5, T6, T7, T8];
export function resolve<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9>(...deps: [Dep<T0>, Dep<T1>, Dep<T2>, Dep<T3>, Dep<T4>, Dep<T5>, Dep<T6>, Dep<T7>, Dep<T8>, Dep<T9>, ...Dep[]]): [T0, T1, T2, T3, T4, T5, T6, T7, T8, T9];
export function resolve(...deps: any[]) {
  if (deps.length > 1) {
    return deps.map((dep) => resolve(dep));
  }
  let instance;
  const dep = deps[0];
  instance = getInstance(dep);
  if (!instance) {
    const OverrideDep = getOverride(dep);
    if (typeof OverrideDep !== "undefined") {
      setInstance(dep, instance = resolve(OverrideDep));
      return instance;
    }
    setResolvePhase(dep, DepResolvePhase.Start);
    if (typeof dep === "function") {
      instance = (typeof dep.prototype === "undefined")
        ? dep()
        : new dep();
    } else {
      instance = dep;
    }
    setInstance(dep, instance);
    setResolvePhase(dep, DepResolvePhase.Finish);
  }
  return instance;
}

type DepsPair = [Dep, Dep];

export function override(from: Dep, to: Dep): void;
export function override(...fromToPairs: DepsPair[]): void;
export function override(...fromOrFromToPairs: any[]) {
  if (Array.isArray(fromOrFromToPairs[0])) {
    (fromOrFromToPairs as DepsPair[]).forEach((pair) => setOverride(...pair));
  } else {
    setOverride(...fromOrFromToPairs as DepsPair);
  }
}

type DepInstPair<T = any> = [Dep<T>, T];

export function assign(dep: Dep, instance: any): void;
export function assign(...depInstPairs: DepInstPair[]): void;
export function assign(...depOrDepInstPairs: any[]) {
  if (Array.isArray(depOrDepInstPairs[0])) {
    (depOrDepInstPairs as DepInstPair[]).forEach((pair) => assign(...pair));
  } else {
    const [dep, instance] = depOrDepInstPairs;
    setInstance(dep, instance);
    const OverrideDep = getOverride(dep);
    if (typeof OverrideDep !== "undefined") {
      assign(OverrideDep, instance);
    }
  }
}

export function reset() {
  Object.keys(instances).forEach((id) => {
    instances[id].clear();
    delete instances[id];
  });
  Object.keys(overrides).forEach((id) => {
    overrides[id].clear();
    delete overrides[id];
  });
  Object.keys(resolvePhases).forEach((id) => {
    resolvePhases[id].clear();
    delete resolvePhases[id];
  });
}

class Chan {
  private signal: () => void;
  private next: Promise<void>;
  private queue: (() => void)[] = [];

  constructor() {
    this.start();
  }

  public fn<T, K extends any[]>(fn: (...args: K) => T, self?: object): (...args: K) => Promise<T> {
    const chan = this;
    return function (this: any, ...args: K) {
      return new Promise((resolve, reject) => {
        chan.run(() => {
          try {
            resolve(fn.apply(self || this, args));
          } catch (error) {
            reject(error);
          }
        });
      });
    };
  }

  private run(fn: () => void) {
    this.queue.push(fn);
    this.signal();
  }

  private start() {
    this.up();
    process.nextTick(async () => {
      while (true) {
        await this.next;
        this.up();
        const actions = this.queue.splice(0);
        actions.forEach((action) => action());
      }
    });
  }

  private up() {
    this.next = new Promise((resolve) => {
      this.signal = resolve;
    });
  }
}

function proxify<T>(val: T): Proxy<T> {
  const chan = new Chan();
  let proxy: any;
  if (Array.isArray(val)) {
    proxy = (val as any[]).map((v) => (
      (typeof v === "function")
        ? chan.fn(v)
        : v
    ));
  } else if (val && typeof val === "object"
    && [Date, Error, Map, Set, WeakMap, WeakSet].every((type) => !(val instanceof type))
  ) {
    proxy = {};
    Object.keys(val).forEach((key) => {
      const v = (val as any)[key];
      if (typeof v !== "function") {
        proxy[key] = v;
      }
    });
    const methods: any = {};
    function collectMethods(obj: object) {
      if (obj && obj !== Object.prototype) {
        const descriptors = Object.getOwnPropertyDescriptors(obj);
        Object.keys(descriptors).forEach((key) => {
          if (typeof descriptors[key].value === "function" && key !== "constructor") {
            methods[key] = key;
          }
        });
        collectMethods((obj as any).__proto__);
      }
    }
    collectMethods(val as any);
    Object.keys(methods).forEach((key) => {
      proxy[key] = chan.fn((val as any)[key], val as any);
    });
  } else if (typeof val === "function") {
    proxy = (chan.fn as any)(val);
  } else {
    proxy = val;
  }
  return proxy;
}

function createProvideDescriptor(dep: Dep, propertyKey: PropertyKey) {
  return {
    get() {
      const instance = resolve(dep);
      Object.defineProperty(this, propertyKey, {
        value: instance,
        enumerable: true,
        configurable: false,
        writable: false,
      });
      return instance;
    },
    enumerable: true,
    configurable: true,
  };
}

function setResolvePhase(dep: Dep, phase: DepResolvePhase) {
  if (typeof resolvePhases[zoneId] === "undefined") {
    resolvePhases[zoneId] = new Map();
  }
  const currentPhase = resolvePhases[zoneId].get(dep);
  if (currentPhase === DepResolvePhase.Start && phase === DepResolvePhase.Start) {
    throw new Error("Circular dependency detected");
  }
  if (phase === DepResolvePhase.Finish) {
    resolvePhases[zoneId].delete(dep);
  } else {
    resolvePhases[zoneId].set(dep, phase);
  }
}

function setInstance(dep: Dep, instance: any) {
  if (typeof instances[zoneId] === "undefined") {
    instances[zoneId] = new Map();
  }
  instances[zoneId].set(dep, instance);
}

function getInstance(dep: Dep): any {
  if (typeof instances[zoneId] !== "undefined") {
    return instances[zoneId].get(dep);
  }
}

function setOverride(from: Dep, to: Dep) {
  if (typeof overrides[zoneId] === "undefined") {
    overrides[zoneId] = new Map();
  }
  overrides[zoneId].set(from, to);
}

function getOverride(from: Dep): Dep | undefined {
  let id = zoneId;
  while (typeof id !== "undefined") {
    if (typeof overrides[id] !== "undefined") {
      const to = overrides[id].get(from);
      if (typeof to !== "undefined") {
        return to;
      }
    }
    id = zoneParentIndex[id];
  }
}

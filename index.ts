import async_hooks, { AsyncHook } from "async_hooks";
import "reflect-metadata";

type Type<T = any> = new (...args: any) => T;
type TypifyObjectMap<T> = {
  [P in keyof T]: Type<T[P]>;
};
type PropertyKey = string | symbol;
type ObjectMap<T = any> = {
  [key: string]: T;
};
type ObjectMapType<T = any> = ObjectMap<Type<T>>;
class Container {
  [key: string]: any;
}
export const RootZoneId = 0;

export const instances: ObjectMap<Map<Type, any>> = {};
export const overrides: ObjectMap<Map<Type, any>> = {};

let zoneId = RootZoneId;

export function getZoneId(): number {
  return zoneId;
}

const zoneAsyncIndex: ObjectMap<number> = {};
const zoneParentIndex: ObjectMap<number> = {};
let hook: AsyncHook;

export function isolate<T = any>(callback: () => T): Promise<T> {
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
        delete zoneAsyncIndex[asyncId];
      },
    }).enable();
  }
  return new Promise((resolve) => {
    process.nextTick(() => {
      const asyncId = async_hooks.executionAsyncId();
      zoneParentIndex[asyncId] = zoneAsyncIndex[asyncId] || RootZoneId;
      zoneId = zoneAsyncIndex[asyncId] = asyncId;
      resolve(callback());
    });
  });
}

export function provide(target: object, propertyKey: PropertyKey): any;
export function provide(Class: Type): (target: object, propertyKey: PropertyKey) => any;
export function provide(target: any, propertyKey?: PropertyKey): any {
  if (typeof target === "function") {
    const Class = target;
    return (target: object, propertyKey: PropertyKey): any => (
      createProvideDescriptor(Class as Type, propertyKey)
    );
  }
  return createProvideDescriptor(
    Reflect.getMetadata("design:type", target, propertyKey!),
    propertyKey!,
  );
}

export function resolve<T>(Class: Type<T>): T;
export function resolve<T0, T1>(...Classes: [Type<T0>, Type<T1>]): [T0, T1];
export function resolve<T0, T1, T2>(...Classes: [Type<T0>, Type<T1>, Type<T2>]): [T0, T1, T2];
export function resolve<T0, T1, T2, T4>(...Classes: [Type<T0>, Type<T1>, Type<T2>, Type<T4>]): [T0, T1, T2, T4];
export function resolve<T0, T1, T2, T4, T5>(...Classes: [Type<T0>, Type<T1>, Type<T2>, Type<T4>, Type<T5>]): [T0, T1, T2, T4, T5];
export function resolve(...Classes: any[]): any {
  if (Classes.length > 1) {
    return Classes.map((Class) => resolve(Class));
  }
  let instance;
  const Class = Classes[0];
  instance = getInstance(Class);
  if (!instance) {
    const OverrideClass = getOverride(Class);
    if (typeof OverrideClass !== "undefined") {
      setInstance(Class, instance = resolve(OverrideClass));
      return instance;
    }
    setInstance(Class, (instance = new Class()));
  }
  return instance;
}

type OverridePair<T = any> = [Type<T>, Type<T>];
type OverridePairs<T = any> = OverridePair<T>[];

export function override(from: Type, to: Type): void;
export function override(...fromToPairs: OverridePairs): void;
export function override(...args: any[]): void {
  if (Array.isArray(args[0])) {
    (args as OverridePairs).forEach((pair) => setOverride(...pair));
  } else {
    setOverride(...args as OverridePair);
  }
}

export function reset() {
  Object.keys(instances).forEach((id) => {
    instances[id].clear();
  });
  Object.keys(overrides).forEach((id) => {
    overrides[id].clear();
  });
}

export function container<T>(options: TypifyObjectMap<T>): T & Container {
  const propDescriptors: any = {};
  Object.keys(options).forEach((key) => {
    propDescriptors[key] = {
      get: () => resolve((options as any)[key]),
      enumerable: true,
      configurable: true,
    };
  });
  const cont = new Container();
  Object.defineProperties(cont, propDescriptors);
  return cont as (T & Container);
}

export function attach(target: object, options: ObjectMapType | Container): void {
  const cont = (options instanceof Container)
    ? options
    : container(options);
  const containerDescriptors = Object.getOwnPropertyDescriptors(cont);
  Object.keys(containerDescriptors).forEach((key) => {
    const descriptor = containerDescriptors[key];
    if (typeof descriptor.get !== "undefined") {
      Object.defineProperty(target, key, {
        get() {
          const instance = descriptor.get!();
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
    }
  });
}

type AssignPair<T = any> = [Type<T>, T];
type AssignPairs<T = any> = AssignPair<T>[];

export function assign(Class: Type, instance: any): void;
export function assign(...ClassInstPairs: AssignPairs): void;
export function assign(...args: any[]) {
  if (Array.isArray(args[0])) {
    (args as AssignPairs).forEach((pair) => assign(...pair));
  } else {
    const [Class, instance] = args;
    setInstance(Class, instance);
    const OverrideClass = getOverride(Class);
    if (typeof OverrideClass !== "undefined") {
      assign(OverrideClass, instance);
    }
  }
}

export function bind<T>(options: TypifyObjectMap<T>): (func: (cont: T & Container, ...args: any[]) => any) => ((...args: any[]) => any);
export function bind<T extends Container>(options: T): (func: (cont: T, ...args: any[]) => any) => ((...args: any[]) => any);
export function bind<T>(options: any): any {
  const cont = (options instanceof Container)
    ? options
    : container(options);
  return (func: any) => {
    return function (this: any, ...args: any[]): any {
      return func.call(this, cont, ...args);
    };
  };
}

function createProvideDescriptor(Class: Type, propertyKey: PropertyKey) {
  return {
    get() {
      const instance = resolve(Class);
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

function setInstance(Class: Type, instance: any) {
  if (typeof instances[zoneId] === "undefined") {
    instances[zoneId] = new Map();
  }
  instances[zoneId].set(Class, instance);
}

function getInstance(Class: Type): any {
  if (typeof instances[zoneId] !== "undefined") {
    return instances[zoneId].get(Class);
  }
}

function setOverride(From: Type, To: Type) {
  if (typeof overrides[zoneId] === "undefined") {
    overrides[zoneId] = new Map();
  }
  overrides[zoneId].set(From, To);
}

function getOverride(From: Type): Type | undefined {
  let id = zoneId;
  while (typeof id !== "undefined") {
    if (typeof overrides[id] !== "undefined") {
      const To = overrides[id].get(From);
      if (typeof To !== "undefined") {
        return To;
      }
    }
    id = zoneParentIndex[id];
  }
}

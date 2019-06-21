import async_hooks, { AsyncHook } from "async_hooks";
import "reflect-metadata";

type ClassType<T = any, K extends any[] = any[]> = new (...args: K) => T;
type ClassTypifyObjectMap<T> = {
  [P in keyof T]: ClassType<T[P]>;
};
type PropertyKey = string | symbol;
type ObjectMap<T = any> = {
  [key: string]: T;
};
class Container {
  readonly [key: string]: {
    get(): object;
  };
}
enum ResolvePhase {
  Start,
  Finish,
}
export const RootZoneId = 0;

export const instances: ObjectMap<Map<ClassType, any>> = {};
export const overrides: ObjectMap<Map<ClassType, any>> = {};
export const resolvePhases: ObjectMap<Map<ClassType, ResolvePhase>> = {};

let zoneId: number = RootZoneId;

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

export function provide<T>(options: ClassTypifyObjectMap<T>): <K, M extends any[]>(Class: ClassType<K, M>) => ClassType<K & T, M>;
export function provide<T extends Container>(options: T): <K, M extends any[]>(Class: ClassType<K, M>) => ClassType<K & T, M>;
export function provide(target: object, propertyKey: PropertyKey): any;
export function provide(Class: ClassType): (target: object, propertyKey: PropertyKey) => any;
export function provide(targetOrClassOrOptions: any, propertyKey?: any): any {
  if (typeof targetOrClassOrOptions === "function") {
    const Class = targetOrClassOrOptions;
    return (target: object, propertyKey: PropertyKey): any => (
      createProvideDescriptor(Class as ClassType, propertyKey)
    );
  }
  if (typeof propertyKey === "undefined") {
    return (Class: any) => {
      attach(Class.prototype, targetOrClassOrOptions);
      return Class;
    };
  }
  return createProvideDescriptor(
    Reflect.getMetadata("design:type", targetOrClassOrOptions, propertyKey!),
    propertyKey!,
  );
}

export function resolve<T>(Class: ClassType<T>): T;
export function resolve<T0, T1>(...Classes: [ClassType<T0>, ClassType<T1>]): [T0, T1];
export function resolve<T0, T1, T2>(...Classes: [ClassType<T0>, ClassType<T1>, ClassType<T2>]): [T0, T1, T2];
export function resolve<T0, T1, T2, T3>(...Classes: [ClassType<T0>, ClassType<T1>, ClassType<T2>, ClassType<T3>]): [T0, T1, T2, T3];
export function resolve<T0, T1, T2, T3, T4>(...Classes: [ClassType<T0>, ClassType<T1>, ClassType<T2>, ClassType<T3>, ClassType<T4>]): [T0, T1, T2, T3, T4];
export function resolve<T0, T1, T2, T3, T4, T5>(...Classes: [ClassType<T0>, ClassType<T1>, ClassType<T2>, ClassType<T3>, ClassType<T4>, ClassType<T5>]): [T0, T1, T2, T3, T4, T5];
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
    setResolvePhase(Class, ResolvePhase.Start);
    setInstance(Class, (instance = new Class()));
    setResolvePhase(Class, ResolvePhase.Finish);
  }
  return instance;
}

type OverridePair<T = any> = [ClassType<T>, ClassType<T>];
type OverridePairs<T = any> = OverridePair<T>[];

export function override(from: ClassType, to: ClassType): void;
export function override(...fromToPairs: OverridePairs): void;
export function override(...fromOrFromToPairs: any[]): void {
  if (Array.isArray(fromOrFromToPairs[0])) {
    (fromOrFromToPairs as OverridePairs).forEach((pair) => setOverride(...pair));
  } else {
    setOverride(...fromOrFromToPairs as OverridePair);
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

export function container<T>(options: ClassTypifyObjectMap<T>): T & Container {
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

export function attach<Y extends object, T>(target: Y, options: ClassTypifyObjectMap<T>): Y & T;
export function attach<Y extends object, T extends Container>(target: Y, options: T): Y & T;
export function attach(target: any, options: any): any {
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
  return target;
}

type AssignPair<T = any> = [ClassType<T>, T];
type AssignPairs<T = any> = AssignPair<T>[];

export function assign(Class: ClassType, instance: any): void;
export function assign(...ClassInstPairs: AssignPairs): void;
export function assign(...ClassOrClassInstPairs: any[]) {
  if (Array.isArray(ClassOrClassInstPairs[0])) {
    (ClassOrClassInstPairs as AssignPairs).forEach((pair) => assign(...pair));
  } else {
    const [Class, instance] = ClassOrClassInstPairs;
    setInstance(Class, instance);
    const OverrideClass = getOverride(Class);
    if (typeof OverrideClass !== "undefined") {
      assign(OverrideClass, instance);
    }
  }
}

export function bind<T>(options: ClassTypifyObjectMap<T>): <M extends any[], K extends any>(func: (cont: T & Container, ...args: M) => K) => ((...args: M) => K);
export function bind<T extends Container>(options: T): <M extends any[], K extends any>(func: (cont: T, ...args: M) => K) => ((...args: M) => K);
export function bind(options: any): any {
  const cont = (options instanceof Container)
    ? options
    : container(options);
  return (func: any) => {
    return function (this: any, ...args: any[]): any {
      return func.call(this, cont, ...args);
    };
  };
}

function createProvideDescriptor(Class: ClassType, propertyKey: PropertyKey) {
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

function setResolvePhase(Class: ClassType, phase: ResolvePhase) {
  if (typeof resolvePhases[zoneId] === "undefined") {
    resolvePhases[zoneId] = new Map();
  }
  const currentPhase = resolvePhases[zoneId].get(Class);
  if (currentPhase === ResolvePhase.Start && phase === ResolvePhase.Start) {
    throw new Error("Circular dependency detected");
  }
  if (phase === ResolvePhase.Finish) {
    resolvePhases[zoneId].delete(Class);
  } else {
    resolvePhases[zoneId].set(Class, phase);
  }
}

function setInstance(Class: ClassType, instance: any) {
  if (typeof instances[zoneId] === "undefined") {
    instances[zoneId] = new Map();
  }
  instances[zoneId].set(Class, instance);
}

function getInstance(Class: ClassType): any {
  if (typeof instances[zoneId] !== "undefined") {
    return instances[zoneId].get(Class);
  }
}

function setOverride(From: ClassType, To: ClassType) {
  if (typeof overrides[zoneId] === "undefined") {
    overrides[zoneId] = new Map();
  }
  overrides[zoneId].set(From, To);
}

function getOverride(From: ClassType): ClassType | undefined {
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

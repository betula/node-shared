import async_hooks, { AsyncHook } from "async_hooks";
import "reflect-metadata";

type Type<T = any> = new (...args: any) => T;
type PropertyKey = string | symbol;

interface MapOfAsyncId {
  [key: number]: number;
}

export const instances = new Map();
export const overrides = new Map();
export const RootZoneId = 0;

const mapOfAsyncId: MapOfAsyncId = {};
let hook: AsyncHook;
let zoneId = RootZoneId;

export function getZoneId(): number {
  return zoneId;
}

export function isolate<T = any>(callback: () => T): Promise<T> {
  if (typeof hook === "undefined") {
    hook = async_hooks.createHook({
      init(asyncId: number, type: any, triggerAsyncId: number) {
        const rootAsyncId = mapOfAsyncId[triggerAsyncId];
        rootAsyncId && (mapOfAsyncId[asyncId] = rootAsyncId);
      },
      before(asyncId: number) {
        zoneId = mapOfAsyncId[asyncId] || RootZoneId;
      },
    }).enable();
  }
  return new Promise((resolve) => {
    process.nextTick(() => {
      const asyncId = async_hooks.executionAsyncId();
      mapOfAsyncId[asyncId] = asyncId;
      resolve(callback());
    });
  });
}

export function provide(target: object, propertyKey: PropertyKey): any;
export function provide(Class: Type): (target: object, propertyKey: PropertyKey) => any;
export function provide(target: object | Type, propertyKey?: PropertyKey): any {
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

export function resolve<T>(Class: Type<T>): T {
  let instance;
  const RedirectedClass = overrides.get(Class);
  if (typeof RedirectedClass !== "undefined") {
    instances.set(Class, instance = resolve<T>(RedirectedClass));
    return instance;
  }
  instance = instances.get(Class);
  if (!instance) {
    instances.set(Class, (instance = new Class()));
  }
  return instance;
}

export function override(from: Type, to: Type): void;
export function override(...fromToPairs: Type[][]): void;
export function override(...args: any[]): void {
  if (Array.isArray(args[0])) {
    (args as Type[][]).forEach((pair) => overrides.set(pair[0], pair[1]));
  } else {
    overrides.set(args[0], args[1]);
  }
}

export function reset() {
  instances.clear();
  overrides.clear();
}

export function container() { }
export function attach() { }
export function bind() { }

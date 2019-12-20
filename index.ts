import async_hooks, { AsyncHook } from "async_hooks";
import "reflect-metadata";

type ObjectMap<T = any> = {
  [key: string]: T;
};

type ClassType<T = any, K extends any[] = any> = new (...args: K) => T;
type Dep<T = any> = ClassType<T> | (() => T) | T;
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

export const zoneIndex: ObjectMap<number> = {};
export const zoneParentIndex: ObjectMap<number> = {};
let hook: AsyncHook;

export function zone<T = void>(callback: () => T): Promise<void> {
  if (typeof hook === "undefined") {
    hook = async_hooks.createHook({
      init(asyncId: number, type: any, triggerAsyncId: number) {
        const rootAsyncId = zoneIndex[triggerAsyncId];
        rootAsyncId && (zoneIndex[asyncId] = rootAsyncId);
      },
      before(asyncId: number) {
        zoneId = zoneIndex[asyncId] || RootZoneId;
      },
      destroy(asyncId: number) {
        delete zoneIndex[asyncId];
      },
    }).enable();
  }
  return new Promise((resolve, reject) => {
    process.nextTick(async () => {
      const asyncId = async_hooks.executionAsyncId();
      zoneParentIndex[asyncId] = zoneIndex[asyncId] || RootZoneId;
      zoneId = zoneIndex[asyncId] = asyncId;
      try {
        await callback();
        resolve();
      } catch (error) {
        reject(error);
      }
      delete zoneParentIndex[asyncId];
      cleanupZone(asyncId);
    });
  });
}

type PropertyKey = string | symbol;

export function provide(target: object, propertyKey: PropertyKey): any;
export function provide(dep: Dep): (target: object, propertyKey: PropertyKey) => any;
export function provide(targetOrDep: any, propertyKey?: any): any {
  if (typeof propertyKey === "undefined") {
    const dep: Dep = targetOrDep;
    return (target: object, propertyKey: PropertyKey): any => (
      createProvideDescriptor(dep, propertyKey)
    );
  }
  return createProvideDescriptor(
    Reflect.getMetadata("design:type", targetOrDep, propertyKey!),
    propertyKey!,
  );
}

export function resolve<T>(dep: Dep<T>): T {
  let instance = getInstance(dep);
  if (!instance) {
    const OverrideDep = getOverride(dep);
    if (typeof OverrideDep !== "undefined") {
      setInstance(dep, instance = resolve(OverrideDep));
      return instance;
    }
    setResolvePhase(dep, DepResolvePhase.Start);
    if (typeof dep === "function") {
      instance = (typeof dep.prototype === "undefined")
        ? (dep as () => T)()
        : new (dep as new () => T)();
    } else {
      instance = dep;
    }
    setInstance(dep, instance);
    setResolvePhase(dep, DepResolvePhase.Finish);
  }
  return instance;
}

export function override(from: Dep, to: Dep) {
  setOverride(from, to);
}

export function assign(dep: Dep, instance: any) {
  setInstance(dep, instance);
  const OverrideDep = getOverride(dep);
  if (typeof OverrideDep !== "undefined") {
    assign(OverrideDep, instance);
  }
}

export function cleanup() {
  Object.keys(instances).forEach((id) => {
    instances[id].clear();
    delete instances[id];
  });
  Object.keys(resolvePhases).forEach((id) => {
    resolvePhases[id].clear();
    delete resolvePhases[id];
  });
}

export function reset() {
  cleanup();
  Object.keys(overrides).forEach((id) => {
    overrides[id].clear();
    delete overrides[id];
  });
}

export function cleanupZone(zoneId: number) {
  if (instances[zoneId]) {
    instances[zoneId].clear();
    delete instances[zoneId];
  }
  if (resolvePhases[zoneId]) {
    resolvePhases[zoneId].clear();
    delete resolvePhases[zoneId];
  }
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

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
const ContainerSymbol = Symbol("Container");
class Container {
  // [ContainerSymbol] = true;

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

type ProvideClassDecRetFn<T, K> = <P, M extends any[]>(Class: ClassType<P, M>) => ClassType<P & T & K, M>;
type DepsUnit<T, K> = ClassTypifyObjectMap<T> | K;
interface DepsConfig extends ObjectMap {}
interface MoreDepsUnit extends ObjectMap {}
interface Cont extends Container {}

export function provide<T extends DepsConfig, K extends Cont>(...setOfDeps: [DepsUnit<T, K>, ...MoreDepsUnit[]]): ProvideClassDecRetFn<T, K>;
export function provide(target: object, propertyKey: PropertyKey): any;
export function provide(Class: ClassType): (target: object, propertyKey: PropertyKey) => any;
export function provide(targetOrClassOrDeps: any, propertyKey?: any): any {
  if (typeof targetOrClassOrDeps === "function") {
    const Class = targetOrClassOrDeps;
    return (target: object, propertyKey: PropertyKey): any => (
      createProvideDescriptor(Class as ClassType, propertyKey)
    );
  }
  if (typeof propertyKey === "undefined" || typeof propertyKey === "object") {
    return (Class: any) => {
      (attach as any)(Class.prototype, ...Array.prototype.slice.call(arguments));
      return Class;
    };
  }
  return createProvideDescriptor(
    Reflect.getMetadata("design:type", targetOrClassOrDeps, propertyKey!),
    propertyKey!,
  );
}

// type Pick<T, K extends keyof T> = {
//   [P in K]: T[P];
// };

// type ObjectPropertyNames<T> = { [K in keyof T]: T[K] extends object ? K : never }[keyof T];
// type ObjectProperties<T> = Pick<T, ObjectPropertyNames<T>>;

// type ContainerRet<T, K> = Container & ObjectProperties<T> & ObjectProperties<K>;
// type ContainerRet_2<T0, K0, T1, K1> = Container & ObjectProperties<T0> & ObjectProperties<K0> & ObjectProperties<T1> & ObjectProperties<K1>;
// type ContainerRet_3<T0, K0, T1, K1, T2, K2> = Container & ObjectProperties<T0> & ObjectProperties<K0> & ObjectProperties<T1> & ObjectProperties<K1> & ObjectProperties<T2> & ObjectProperties<K2>;


type ContainerRet<T, K> = Container & T & K;
type ContainerRet_2<T0, K0, T1, K1> = Container & T0 & K0 & T1 & K1;
type ContainerRet_3<T0, K0, T1, K1, T2, K2> = Container & T0 & K0 & T1 & K1 & T2 & K2;

class A { a: number; }
class B { b: number; }
class C { c: number; }
// const m = container({ a: A }, { b: B }, container({ c: C }));
// const p = container({ a: A });

// const o = container({ a: A }, { b: B }, container({ c: C }))

// type F<T> = {
//   [P in keyof T]: T[P] extends object ? typeof T[P] : ;
// };

// interface Y<T extends ObjectMap> {

// }

// type Cnt<T = any> = {
//   [P in keyof T]: T[P];
// } & Container;

container({a: typeof A })

const l = container({ a: A });


const u = container(l, { b: B, c: C });

const t = container(u);

// type Merge<T> = {
//   [P in keyof T]: T[P];
// };


// type Hrr<T> = {
//   [P in keyof T]: T[P] extends object ? T[P] : ClassType<T[P]>;
// };
///// ---- worked ----
// export function container<T>(...setOfOptions: [Hrr<T>]): T;
// type Hrr<T> = {
//   [P in keyof T]: (T[P] extends (...args: any[]) => infer R ? R : ClassType<T[P]>) | T[P];
// };
//////

type _DepsConfig<T> = {
  [P in keyof T]: ClassType<T[P]> | T[P];
};
type _Deps = {
  [key: string]: any;
};
type _MoreDepsConfig = {
  [key: string]: any;
};

// type _Cont<T extends ObjectMap = ObjectMap> = ObjMap<T> & { [ContainerSymbol]: boolean };

// type _C = {
//   [ContainerSymbol]: 1;
// };

export function container<T extends _Deps>(...setOfConfigs: [_DepsConfig<T>]): T;
export function container<T0 extends _Deps, T1 extends _Deps>(...setOfConfigs: [_DepsConfig<T0>, _DepsConfig<T1>]): T0 & T1;
export function container<T0 extends _Deps, T1 extends _Deps, T2 extends _Deps>(...setOfConfigs: [_DepsConfig<T0>, _DepsConfig<T1>, _DepsConfig<T2>]): T0 & T1 & T2;
export function container<T0 extends _Deps, T1 extends _Deps, T2 extends _Deps, T3 extends _Deps>(...setOfConfigs: [_DepsConfig<T0>, _DepsConfig<T1>, _DepsConfig<T2>, _DepsConfig<T3>]): T0 & T1 & T2 & T3;
export function container<T0 extends _Deps, T1 extends _Deps, T2 extends _Deps, T3 extends _Deps, T4 extends _Deps>(...setOfConfigs: [_DepsConfig<T0>, _DepsConfig<T1>, _DepsConfig<T2>, _DepsConfig<T3>, _DepsConfig<T4>, ..._MoreDepsConfig[]]): T0 & T1 & T2 & T3 & T4;


// export function container<T extends DepsConfig, K extends Cont>(...setOfOptions: [DepsUnit<T, K>]): ContainerRet<T, K>;
// export function container<T0 extends DepsConfig, K0 extends Cont, T1 extends DepsConfig, K1 extends Cont>(...setOfOptions: [DepsUnit<T0, K0>, DepsUnit<T1, K1>]): ContainerRet_2<T0, K0, T1, K1>;
// export function container<T0 extends DepsConfig, K0 extends Cont, T1 extends DepsConfig, K1 extends Cont, T2 extends DepsConfig, K2 extends Cont>(...setOfOptions: [DepsUnit<T0, K0>, DepsUnit<T1, K1>, DepsUnit<T2, K2>, ...MoreDepsUnit[]]): ContainerRet_3<T0, K0, T1, K1, T2, K2>;
export function container(...setOfConfigs: any[]) {
  // Так же это может быть простым значением, каким угодно, его тоже обработать
  const propDescriptors: any = {};
  setOfConfigs.forEach((options: any) => {
    const isContainer = options instanceof Container;
    Object.keys(options).forEach((key) => {
      propDescriptors[key] = {
        get: isContainer
          ? Object.getOwnPropertyDescriptor(options, key)!.get
          : () => resolve((options as any)[key]),
        enumerable: true,
        configurable: true,
      };
    });
  });
  const cont = new Container();
  Object.defineProperties(cont, propDescriptors);
  return cont;
}

type AttachRet<Y, T, K> = Y & T & K;
type AttachRet_2<Y, T0, K0, T1, K1> = Y & T0 & K0 & T1 & K1;
type AttachRet_3<Y, T0, K0, T1, K1, T2, K2> = Y & T0 & K0 & T1 & K1 & T2 & K2;

export function attach<Y extends object, T extends DepsConfig, K extends Cont>(target: Y, ...setOfOptions: [DepsUnit<T, K>]): AttachRet<Y, T, K>;
export function attach<Y extends object, T0 extends DepsConfig, K0 extends Cont, T1 extends DepsConfig, K1 extends Cont>(target: Y, ...setOfOptions: [DepsUnit<T0, K0>, DepsUnit<T1, K1>]): AttachRet_2<Y, T0, K0, T1, K1>;
export function attach<Y extends object, T0 extends DepsConfig, K0 extends Cont, T1 extends DepsConfig, K1 extends Cont, T2 extends DepsConfig, K2 extends Cont>(target: Y, ...setOfOptions: [DepsUnit<T0, K0>, DepsUnit<T1, K1>, DepsUnit<T2, K2>, ...MoreDepsUnit[]]): AttachRet_3<Y, T0, K0, T1, K1, T2, K2>;
export function attach(target: any, ...setOfOptions: any[]) {
  const cont = (container as any)(...setOfOptions);
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

type BindDecFn<T> = <M extends any[], P extends any>(func: (cont: T, ...args: M) => P) => ((...args: M) => P);
type BindRet<T, K> = BindDecFn<ContainerRet<T, K>>;
type BindRet_2<T0, K0, T1, K1> = BindDecFn<ContainerRet_2<T0, K0, T1, K1>>;
type BindRet_3<T0, K0, T1, K1, T2, K2> = BindDecFn<ContainerRet_3<T0, K0, T1, K1, T2, K2>>;

// class A { a: number; }
// class B { b: number; }
// class C { c: number; }
// const m = container({ a: A }, { b: B }, container({ c: C }));
// const p = container({ a: A });

// const o = container({ a: A }, { b: B }, container({ c: C }))

// bind(o)((cont, x: string) => cont.b.b)("hello");

export function bind<T extends DepsConfig, K extends Cont>(...setOfOptions: [DepsUnit<T, K>]): BindRet<T, K>;
export function bind<T0 extends DepsConfig, K0 extends Cont, T1 extends DepsConfig, K1 extends Cont>(...setOfOptions: [DepsUnit<T0, K0>, DepsUnit<T1, K1>]): BindRet_2<T0, K0, T1, K1>;
export function bind<T0 extends DepsConfig, K0 extends Cont, T1 extends DepsConfig, K1 extends Cont, T2 extends DepsConfig, K2 extends Cont>(...setOfOptions: [DepsUnit<T0, K0>, DepsUnit<T1, K1>, DepsUnit<T2, K2>, ...MoreDepsUnit[]]): BindRet_3<T0, K0, T1, K1, T2, K2>;
export function bind(...setOfOptions: any[]) {
  const cont = (container as any)(...setOfOptions);
  return (func: any) => {
    return function (this: any, ...args: any[]): any {
      return func.call(this, cont, ...args);
    };
  };
}

// Обработать ...More

export function resolve<T>(Class: ClassType<T>): T;
export function resolve<T0, T1>(...Classes: [ClassType<T0>, ClassType<T1>]): [T0, T1];
export function resolve<T0, T1, T2>(...Classes: [ClassType<T0>, ClassType<T1>, ClassType<T2>]): [T0, T1, T2];
export function resolve<T0, T1, T2, T3>(...Classes: [ClassType<T0>, ClassType<T1>, ClassType<T2>, ClassType<T3>]): [T0, T1, T2, T3];
export function resolve<T0, T1, T2, T3, T4>(...Classes: [ClassType<T0>, ClassType<T1>, ClassType<T2>, ClassType<T3>, ClassType<T4>]): [T0, T1, T2, T3, T4];
export function resolve<T0, T1, T2, T3, T4, T5>(...Classes: [ClassType<T0>, ClassType<T1>, ClassType<T2>, ClassType<T3>, ClassType<T4>, ClassType<T5>]): [T0, T1, T2, T3, T4, T5];
export function resolve(...Classes: any[]) {
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
export function override(...fromOrFromToPairs: any[]) {
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

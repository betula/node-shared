import "reflect-metadata";

type Type<T = any> = new (...args: any) => T;
type PropertyKey = string | symbol;

export const instances = new Map();
export const redirects = new Map();

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
  const RedirectedClass = redirects.get(Class);
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

export function redirect(from: Type, to: Type): void;
export function redirect(...fromToPairs: Type[][]): void;
export function redirect(...args: any[]): void {
  if (Array.isArray(args[0])) {
    (args as Type[][]).forEach((pair) => redirects.set(pair[0], pair[1]));
  } else {
    redirects.set(args[0], args[1]);
  }
}

export function reset() {
  instances.clear();
  redirects.clear();
}

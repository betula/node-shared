import "reflect-metadata";

type Type<T = any> = new (...args: any) => T;

const instances = new Map();
const redirects = new Map();

export function provide(target: object, propertyKey: string): any {
  const Class = Reflect.getMetadata("design:type", target, propertyKey);
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
  Class = redirects.get(Class) || Class;
  let instance = instances.get(Class);
  if (!instance) {
    instances.set(Class, (instance = new Class()));
  }
  return instance;
}

export function redirect(from: Type, to: Type): void;
export function redirect(...pairs: Type[][]): void;
export function redirect(...args: any[]): void {
  if (Array.isArray(args[0])) {
    (args as Type[][]).forEach((pair) => redirect(pair[0], pair[1]));
  } else {
    redirects.set(args[0], args[1]);
  }
}

export function reset() {
  instances.clear();
  redirects.clear();
}

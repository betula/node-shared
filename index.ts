import "reflect-metadata";

const instances = new Map();

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

export function resolve<T>(Class: new (...args: any) => T): T {
  let instance = instances.get(Class);
  if (!instance) {
    instances.set(Class, (instance = new Class()));
  }
  return instance;
}

export function reset() {
  instances.clear();
}

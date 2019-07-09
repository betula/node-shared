---
id: api
title: API Reference
sidebar_label: API Reference
---

## resolve

Returns instance of your dependency, or list of instances for an array of dependencies. Each dependency can be class, function or any value.
- For class. The class will be instantiated once and cached
- For function. The function will be called and result cached
- For any value. Return it value without any changes

```javascript
const depInstance = resolve(Dep);
const [ dep1, dep2, ... ] = resolve(Dep1, Dep2, ...);
```

## container

Returns a plain object with instantiated values. Each argument can be the object of dependencies or result of previous `container` call. The result will be merged.

```javascript
const cont1 = container({ dep1: Dep1, dep2: Dep2, ... }, { dep3, Dep3 }, ...);
const cont2 = container({ dep4: Dep4 }, cont1, { dep5: Dep5 }, container({ dep6: Dep6 }, ...), ...);
const { dep1, dep2, dep3, dep4, dep5, dep6, ... } = cont2;
```

## inject

Decorator to provide dependencies into object or class. If it runs without arguments it uses reflect metadata for determine list of dependencies from class constructor parameters. For TypeScript your need enable `experimentalDecorators` and `emitDecoratorMetadata` options in your `tsconfig.json`.

```typescript
@inject // or @inject() its same
class A {
  constructor(public dep1: Dep1, public dep2: Dep2, ...) {}
}
const a = new (A as new () => A); // Important: TypeScript can't understanding that constructor signature was changed after use `inject` decorator
// ...

// Or if A is dependency too you can use `resolve` to get an instance of it
const a = resolve(A);
```

If it runs with an array of dependency it works the same but without reflect metadata.

```javascript
@inject([Dep1, Dep2, Dep3, ...])
class {
  constructor(dep1, dep2, dep3, ...) {}
}
```

Or exists signature of this method same as `container`, but return decorator function with injecting all dependency instances into `prototype` if it's class, or into `this` if its plain object.

```javascript
const decorator = @inject({ dep1: Dep1 }, container({ dep2, Dep2 }), ...);
const Class = decorator(class {
  anyMethodOrConstructor() {
    const { dep1, dep2 } = this;
  }
});
const obj = decorator({
  anyMethod() {
    const { dep1, dep2 } = this;
  }
});
```

## provide

Property decorator for providing an instance of dependency on the class property had two overridden signatures. One of them without parameter used reflect metadata for taking dependency, next one uses dependency from parameter.

```typescript
class {
  @provide dep1: Dep1;
  @provide(Dep2): dep2;
}
```

In TypeScript exists the problem that it doesn't understand that property from non initialized has been transformed to getter. You can disable `strictPropertyInitialization` in your `tsconfig.json` or using with an exclamation mark.

```typescript
class {
  @provide dep1!: Dep1;
}
```

## attach

Provide instances of dependencies into the object. Signature of function same as the `container`.

```javascript
const m = {};
const m2 = attach(m, { dep1: Dep1, ...}, container({ dep2: Dep2, ...}, ...), ...);
console.log(m === m2); // true
const dep1 = m.dep1;
const dep2 = m.dep2;
```

## bind

Function decorator for provide container as the first parameter in the decorated function. Signature of function same as the `container`.

```javascript
const decorator = bind({ dep1: Dep1, ...}, container({ dep2: Dep2, ...}), ...);
const fn = decorator((cont, x, y) => {
  const dep1 = cont.dep1;
  const dep2 = cont.dep2;
  // ...
});
fn(x, y);
```

## override

Override dependency.

```javascript
override(FromDep, ToDep);
// ...
console.log(resolve(FromDep) === resolve(ToDep)); // true
```

## assign

Define any value as resolved value for any dependency.

```javascript
assign(Dep, value);
// ...
class A {}
assign(A, 10);
console.log(resolve(A)); // 10
```

## isolate

Run your app in isolated Dependency Injection scope. All instances cached for this instance application will be isolated from all cached instances in other scopes. All overrides defined here will be inherited for nested isolated scopes but not available for others. The return value can be object, function, or any other value:
- For object. All methods will be proxied and their return values converted to promises of them
- For function. The function will be proxied and return value converted to promise of it.
- For any value. Return it value without any changes

```javascript
const proxy = await isolate(() => {
  const app = new App(); // Run you app here
  // ...
  return {
    methodA() {},
    methodB() {},
    // ...
  }
});
// ...
await proxy.methodA();
await proxy.methodB();
```

```javascript
await isolate(async () => {
  override(Dep1, Dep2);

  await isolate(async () => {
    override(Dep2, Dep3);
    // ...
    console.log(resolve(Dep1) instanceof Dep3); // true
  });
  // ...
  console.log(resolve(Dep1) instanceof Dep2); // true
})
```

## cleanup

Clean all cached dependency instances. It's needed for testing. Has no parameters.

```javascript
// ...
after(cleanup);
// ...
```

## reset

Clean all cached dependency instances and overrides. Has no parameters.

```javascript
reset()
```

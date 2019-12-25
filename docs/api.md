---
id: api
title: API Reference
sidebar_label: API Reference
---

## resolve

Returns instance of your dependency. Each dependency can be class, function or any value.
- For class. The class will be instantiated once and cached
- For function. The function will be called and result cached
- For any value. Return it value without any changes

```javascript
const depInstance = resolve(Dep);
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

## zone

Run your app in isolated Dependency Injection scope. All instances cached for this instance application will be isolated from all cached instances in other scopes. All overrides defined here will be inherited for nested isolated scopes but not available for others. No return value.

```javascript
await zone(async () => {
  const app = new App(); // Run you app here
  await app.run();
  // ...
});
```

```javascript
await zone(async () => {
  override(Dep1, Dep2);

  await zone(async () => {
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

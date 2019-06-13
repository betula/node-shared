node-provide is more than simple decorator for control your dependencies. It's a powerful instrument for organizing the architecture of your application.

The better experience you will get if you use node-provide with TypeScript because in this case, you can get an instance of your dependency with 9 character instruction.

I recommend to split all code of your project into three different types:
1. Library. It's a code who doesn't need any dependencies from your application. Drivers for databases or crypto hash creators or something else what you can find in npm.
2. Services. It's a code split by classes and any other structures. We need each of the services in one instance. For example, configured database connection pool or configured express server or it can be a factory of anything.
3. Other code born through decomposition or as a normal process throw application grown up.

node-provide helps to you use a single instance of any class with zero parameters in constructor at any place of your application. Usually this type of abstraction named service.

Each class provided through node-provide do instantiate only on demand in first access to it.

```ts
import { provide } from "node-provide";

class Hello {
  public send(text: string) {
    console.log(`Hello ${text}`);
  }
}

class App {
  @provide public hello: Hello;
  constructor() {
    this.hello.send("world!");
  }
}

const app = new App();
```

You can see a graceful example of server for RESTfull API in examples folder inside this ([repository](https://github.com/betula/node-provide/tree/master/examples/server-with-jest)).

If you have questions or something else for me or this project. Maybe architectures questions, improvement ideas or anything else. Please make issues. I want to continue to develop this project and each of your opinions and thoughts will be grateful.

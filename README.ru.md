# node-provide
[![npm version](https://badge.fury.io/js/node-provide.svg)](https://badge.fury.io/js/node-provide)
[![Build Status](https://travis-ci.org/betula/node-provide.svg?branch=master)](https://travis-ci.org/betula/node-provide)
[![Coverage Status](https://coveralls.io/repos/github/betula/node-provide/badge.svg?branch=master)](https://coveralls.io/github/betula/node-provide?branch=master)

Библиотека для внедрения зависимостей. Позволяет легко поставлять инстанцированные в единственном экземпляре зависимости в любую точку важего приложения без необходимости предварительного проектирования архитектуры приложения под использование привычных механизмов внедрения зависимостей.

Каждая зависимостей определяется как класс без параметров в конструкторе, либо функция без аргументов. Наиболее удобным является использование декоратора `provide` в TypeScript, но так же поддерживает приятный синтаксис и для JavaScript как с использованием декораторов, так и без них, в случае использования "чистой" Node.JS без каких-либо препроцессоров кода. В качестве идентификатора для зависимости используется класс или функция её определяющая.

Пример использования в TypeScript
```TypeScript
import { provide } from "node-provide";

class Server {
  public configure(port: number = 80, hostname?: string) {
    //...
  }
  public route(pattern: string, callback: (req: Request, res: Response) => void) {
    //...
  }
  public start() {
    //...
  }
}

class IndexController {
  // Использование декоратора `provide`,
  // теперь инстанция класса Server доступна через `this.server`.
  @provide server: Server;
  public mount() {
    this.server.route("/", this.index.bind(this));
  }
  public index(req: Request, res: Response) {
    res.send("index");
  }
}

class App {
  @provide server: Server;
  @provide indexController: IndexController;
  public start() {
    this.server.configure();
    this.indexController.mount();
    this.server.start();
  }
}
```

Не забудьте включить опцию `emitDecoratorMetadata` в вашем `tsconfig.json` файле. Так же будет необходимо отключить опцию `strictPropertyInitialization`, так как TypeScript на данный момент не умеет вычислять преобразование поля класса в геттер через декоратор и считает такие поля не инициализированными и будет ошибочно "требовать" их инициализации в конструкторе.

На JavaScript с использованием декораторов использование `provide` будет выглядеть так:

```JavaScript
import { provide } from "node-provide";

class Server {
  start() {
    //...
  }
}

class App {
  // Здесь используется декоратор `provide`,
  // где первым аргументом передан класс зависимости.
  @provide(Server) server;
  start() {
    this.server.start();
  }
}
```

Так же можно описать зависимость через функцию возвращающую объект с набором методов для работы с ней. Тут декораторы уже не потребуется, что значит можно использовать "чистый" Node.JS без каких-либо преобразований.

```JavaScript
// app.js
const { container } = require("node-provide");
const Server = require("./server");
const IndexController = require("./index-controller");

const services = container({
  server: Server,
  indexController: IndexController,
});

module.exports = function() {
  //...
  return {
    start() {
      services.server.configure();
      services.indexController.mount();
    }
  }
}

// Если вам не нужно определять `App` как зависимость,
// то можете создать его инстанцию явно.
// index.js
const App = require("./app");
new App().start();

// Если же вы хотите, что бы `App` был полноценной зависимостью,
// доступной в любой точке приложения,
// то можете инстанцировать его через `resolve`.
// index.js
const { resolve } = require("node-provide");
const App = require("./app");
resolve(App).start();
```

Есть ещё несколько вариантов поставить зависимости, отличающиеся друг от друга синтаксически.



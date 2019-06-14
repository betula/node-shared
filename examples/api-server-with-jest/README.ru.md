И необходимо сконфигурировать сброс кеша зависимостей после каждого тест кейса в файле jest.config.js для jest

```JS
module.exports = {
  setupFilesAfterEnv: [
    "node-provide/jest-cleanup-after-each"
  ]
}
```

Example of simple server architecture based on node-provide.

You can try this example:

```bash
npm i
npm run start
```

For easy jest integration you need add some instruction to your `jest.config.js` file:

```JavaScript
module.exports = {
  setupFilesAfterEnv: [
    "node-provide/jest-cleanup-after-each"
  ]
}
```

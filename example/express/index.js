const express = require('express');
const app = express();
const port = 3000;
const redis = require('redis');
const { ResponseCacheMiddleware } = require('../../dist');

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});
ResponseCacheMiddleware.init({
  name: 'express-app',
  redisClient,
});

app.use(
  ResponseCacheMiddleware.getInstance().expressUse({
    cacheItems: [
      {
        name: 'firstCache',
        path: '/id/:id',
        expire: 0,
        includeQueryKeys: ['b'],
        excludeQueryKeys: ['b'],
      },
      {
        name: 'firstCacheAll',
        path: '/id1/getAll',
      },
    ],
  }),
);

// app.get('/', (req, res) => {
//   res.send('Hello World!');
//   // res.json({ aa: 1 });
// });

app.get('/clean', (req, res) => {
  ResponseCacheMiddleware.getInstance().cleanAllCache();
  res.send('123');
});

app.get('/id1/getAll', (req, res) => {
  // res.send('Hello World! getAll');
  res.json({ a: 1 });
});

app.get('/id/:id', (req, res) => {
  setTimeout(() => {
    res.send(`Hello World! idid ${Date.now()}`);
  }, 2000);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

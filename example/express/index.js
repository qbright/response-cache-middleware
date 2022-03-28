const express = require('express');
const app = express();
const port = 3000;
const redis = require('redis');
const ResponseCacheMiddleware = require('../../dist');

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
        // name:'firstCache',
        path: '/id/:id',
      },
      {
        name: 'firstCacheAll',
        path: '/id1/getAll',
      },
    ],
  }),
);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/id1/getAll', (req, res) => {
  res.send('Hello World! getAll');
});

app.get('/id/:id', (req, res) => {
  res.send('Hello World! idid ');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

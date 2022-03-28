import { CacheItem, CacheOptions } from '../options/cache-options';
import { parse } from 'path-to-regexp';
import { RegisterOptionParams } from '../../dist/types/options/register-options';

interface MatchResult {
  path: string;
  index: number;
  params: {
    [key: string]: any;
  };
}

export async function expressHandler(
  options: RegisterOptionParams,
  cacheItem: CacheItem,
  cacheOptions: CacheOptions,
  req: any,
  res: any,
  next: () => void,
) {
  const query = filterQuery(
    req.query,
    cacheItem.includeQueryKeys,
    cacheItem.excludeQueryKeys,
  );
  const cacheKey = formatCacheKey(
    options.name,
    req.path,
    query,
    cacheItem.name,
  );

  const redisClient = options.redisClient;

  const cacheData = await getCache(redisClient, cacheKey);

  if (cacheData !== null && cacheData !== undefined) {
    res.send(JSON.parse(cacheData));
    res.end();
    return;
  } else {
    const originSend = res.send;
    res.send = function (...args: any[]) {
      const cacheDataString = JSON.stringify(args[0]);
      store(
        redisClient,
        cacheKey,
        cacheDataString,
        getExpire(cacheItem.expire, cacheOptions.expire),
      );
      originSend.apply(this, args);
    };

    next();
  }
}

function formatCacheKey(
  appName: string,
  path: string,
  query: any,
  name?: string,
) {
  const keys = Object.keys(query).sort();

  let cacheKey = path;
  keys.forEach((key) => {
    cacheKey += `${key}=${query[key]}|`;
  });
  cacheKey = `${appName}:${name ? name + ':' : ''}${encodeURIComponent(
    cacheKey,
  )}`;
  return cacheKey;
}

async function getCache(redisClient: any, key: string) {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return await redisClient.get(key);
}

function getExpire(itemExpire: any, optionsExpire: any) {
  if (itemExpire !== null && itemExpire !== undefined) {
    return itemExpire;
  } else if (optionsExpire !== null && optionsExpire !== undefined) {
    return optionsExpire;
  } else {
    return -1;
  }
}

async function store(
  redisClient: any,
  key: string,
  value: any,
  expire: number,
) {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  await redisClient.set(key, value);
  if (expire > 0) {
    await redisClient.expire(key, expire);
  }
}

function filterQuery(
  query: any,
  includeQueryKeys?: string[],
  excludeQueryKeys?: string[],
) {
  let handledQuery: any = {};
  const tempQuery = Object.assign({}, query);
  if (includeQueryKeys) {
    // includeQueryKeys exist
    includeQueryKeys.forEach((key) => {
      if (tempQuery[key] != undefined) {
        handledQuery[key] = tempQuery[key];
      }
    });
    if (excludeQueryKeys) {
      //  includeQueryKeys and excludeQueryKeys both exist
      excludeQueryKeys.forEach((keys) => {
        delete handledQuery[keys];
      });
    }
  } else if (excludeQueryKeys) {
    // only excludeQueryKey exist

    excludeQueryKeys.forEach((key) => {
      delete tempQuery[key];
    });

    handledQuery = Object.assign({}, tempQuery);
  } else {
    // both includeQueryKeys and excludeQueryKeys are not exist
    handledQuery = Object.assign({}, tempQuery);
  }

  return handledQuery;
}

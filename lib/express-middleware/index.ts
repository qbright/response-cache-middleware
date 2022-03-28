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
  res: Response,
  next: () => void,
) {
  const query = req.query;
  const cacheKey = formatCacheKey(
    options.name,
    req.path,
    query,
    cacheItem.name,
  );

  const redisClient = options.redisClient;

  next();
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
  await redisClient.expire(key, expire);
}

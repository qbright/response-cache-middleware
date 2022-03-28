export interface CacheOptions {
  cacheItems: CacheItem[];
  expire: number;
}

export interface CacheItem {
  name?: string;
  path: string;
  includeQueryKeys?: string[];
  excludeQueryKeys?: string[];
  expire: number;
  exp: RegExp;
  match: any;
}

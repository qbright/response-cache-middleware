export interface CacheOptions {
  cacheItems: CacheItem[];
  expire: number;
}

export interface CacheItem {
  name?: string;
  path: string;
  includeParams?: string[];
  excludeParams?: string[];
  expire: number;
  exp: RegExp;
  match: any;
}

import { RegisterOptionParams } from './options/register-options';
import { expressHandler } from './express-middleware/index';
import { CacheOptions } from './options/cache-options';

import { pathToRegexp, match, parse, compile } from 'path-to-regexp';

class ResponseCacheMiddleware {
  options: RegisterOptionParams;
  cacheOptions: CacheOptions = { cacheItems: [], expire: 0 };

  private static instance: ResponseCacheMiddleware;

  private constructor(options: RegisterOptionParams) {
    this.options = options;
  }

  expressUse(options: CacheOptions) {
    options.cacheItems &&
      options.cacheItems.forEach((item) => {
        item.match = match(item.path, { decode: decodeURIComponent });
      });

    this.cacheOptions.cacheItems = this.cacheOptions.cacheItems.concat(
      options.cacheItems,
    );

    return (req: any, res: any, next: () => void) => {
      if (req.method !== 'GET') {
        next();
        return;
      }

      let matchItem;
      for (let i = 0; i < this.cacheOptions.cacheItems.length; i++) {
        const item = this.cacheOptions.cacheItems[i];
        if (item.match(req.path)) {
          matchItem = item;
          break;
        }
      }

      if (!matchItem) {
        next();
      } else {
        expressHandler(
          this.options,
          matchItem,
          this.cacheOptions,
          req,
          res,
          next,
        );
      }
    };
  }

  public static init(options: RegisterOptionParams) {
    ResponseCacheMiddleware.instance = new ResponseCacheMiddleware(options);
  }

  public static getInstance(): ResponseCacheMiddleware {
    if (!ResponseCacheMiddleware.instance) {
      throw new Error('instance no init');
    }
    return ResponseCacheMiddleware.instance;
  }
}

export default ResponseCacheMiddleware;

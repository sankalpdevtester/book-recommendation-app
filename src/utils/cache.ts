// src/utils/cache.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { setTimeout } from 'timers';

interface CacheEntry {
  data: any;
  expiresAt: number;
}

class Cache {
  private cache: { [key: string]: CacheEntry };
  private ttl: number;

  constructor(ttl: number = 60 * 1000) {
    this.cache = {};
    this.ttl = ttl;
  }

  get(key: string): any {
    const entry = this.cache[key];
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      delete this.cache[key];
      return null;
    }
    return entry.data;
  }

  set(key: string, data: any): void {
    this.cache[key] = {
      data,
      expiresAt: Date.now() + this.ttl,
    };
  }

  delete(key: string): void {
    delete this.cache[key];
  }
}

const cache = new Cache();

const getCache = (client: ApolloClient<any>) => {
  return {
    get: (key: string) => cache.get(key),
    set: (key: string, data: any) => cache.set(key, data),
    delete: (key: string) => cache.delete(key),
  };
};

const createCache = (ttl: number = 60 * 1000) => {
  return new Cache(ttl);
};

const cacheMiddleware = (client: ApolloClient<any>) => {
  return async (operation: any, forward: any) => {
    const cacheKey = operation.getContext().cacheKey;
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
    const response = await forward(operation);
    cache.set(cacheKey, response.data);
    return response;
  };
};

export { getCache, createCache, cacheMiddleware };

// Example usage:
// const client = new ApolloClient({
//   cache: new InMemoryCache(),
//   link: new HttpLink({
//     uri: 'https://example.com/graphql',
//   }),
//   cacheMiddleware,
// });

// const cache = getCache(client);
// cache.set('example-key', { example: 'data' });
// console.log(cache.get('example-key')); // { example: 'data' }
// src/utils/cache.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { GraphQLResponse } from 'graphql';

interface CacheOptions {
  ttl: number; // time to live in seconds
}

class Cache {
  private cache: { [key: string]: { data: any; expiresAt: number } };
  private ttl: number;

  constructor(options: CacheOptions) {
    this.cache = {};
    this.ttl = options.ttl;
  }

  get(key: string): any {
    const cachedValue = this.cache[key];
    if (!cachedValue) return null;
    if (cachedValue.expiresAt < Date.now()) {
      delete this.cache[key];
      return null;
    }
    return cachedValue.data;
  }

  set(key: string, data: any): void {
    this.cache[key] = {
      data,
      expiresAt: Date.now() + this.ttl * 1000,
    };
  }

  delete(key: string): void {
    delete this.cache[key];
  }
}

const cache = new Cache({ ttl: 60 * 5 }); // 5 minutes

const cacheMiddleware = async (
  request: any,
  next: (request: any) => Promise<GraphQLResponse>
) => {
  const cacheKey = request.variables;
  const cachedResponse = cache.get(JSON.stringify(cacheKey));
  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await next(request);
  cache.set(JSON.stringify(cacheKey), response);
  return response;
};

export { cacheMiddleware };

// Example usage in src/apollo-client.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { cacheMiddleware } from './utils/cache';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  middleware: [cacheMiddleware],
});
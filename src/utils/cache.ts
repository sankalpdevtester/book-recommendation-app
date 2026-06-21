// src/utils/cache.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { GraphQLResponse } from 'graphql';

interface CacheOptions {
  ttl: number; // time to live in seconds
}

class Cache {
  private cache: Map<string, { data: any; expiresAt: number }>;
  private ttl: number;

  constructor(options: CacheOptions) {
    this.cache = new Map();
    this.ttl = options.ttl;
  }

  get(key: string): any {
    const cachedValue = this.cache.get(key);
    if (!cachedValue) return null;
    if (cachedValue.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return cachedValue.data;
  }

  set(key: string, data: any): void {
    const expiresAt = Date.now() + this.ttl * 1000;
    this.cache.set(key, { data, expiresAt });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

const cache = new Cache({ ttl: 300 }); // 5 minutes

const getCacheKey = (query: string, variables: any): string => {
  return JSON.stringify({ query, variables });
};

const cacheMiddleware = async (
  client: ApolloClient<any>,
  { query, variables }: any,
  next: any
): Promise<GraphQLResponse> => {
  const cacheKey = getCacheKey(query, variables);
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await next();
  cache.set(cacheKey, response);
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
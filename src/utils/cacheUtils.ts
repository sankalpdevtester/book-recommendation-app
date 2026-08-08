// src/utils/cacheUtils.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { Cache } from 'apollo-cache-inmemory';
import { stringify } from 'querystring';

interface CacheOptions {
  ttl: number;
}

class CacheUtils {
  private cache: InMemoryCache;
  private ttl: number;

  constructor(cache: InMemoryCache, options: CacheOptions) {
    this.cache = cache;
    this.ttl = options.ttl;
  }

  public getCacheKey(query: string, variables: any): string {
    return `${query}_${stringify(variables)}`;
  }

  public getFromCache(query: string, variables: any): any {
    const cacheKey = this.getCacheKey(query, variables);
    return this.cache.get(cacheKey);
  }

  public setInCache(query: string, variables: any, data: any): void {
    const cacheKey = this.getCacheKey(query, variables);
    this.cache.set(cacheKey, data);
    this.cache.set(`ttl_${cacheKey}`, Date.now() + this.ttl);
  }

  public isValidCache(query: string, variables: any): boolean {
    const cacheKey = this.getCacheKey(query, variables);
    const ttlKey = `ttl_${cacheKey}`;
    const ttl = this.cache.get(ttlKey);
    if (ttl) {
      return Date.now() < ttl;
    }
    return false;
  }

  public clearCache(query: string, variables: any): void {
    const cacheKey = this.getCacheKey(query, variables);
    this.cache.remove(cacheKey);
    this.cache.remove(`ttl_${cacheKey}`);
  }
}

export function createCacheUtils(client: ApolloClient<any>, options: CacheOptions): CacheUtils {
  return new CacheUtils(client.cache, options);
}

export function useCacheUtils(): CacheUtils {
  const client = require('../apollo-client').default;
  const cacheUtils = createCacheUtils(client, { ttl: 30000 });
  return cacheUtils;
}
```
```typescript
// src/pages/BookSearch.tsx
import React, { useState, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { useCacheUtils } from '../utils/cacheUtils';

const BookSearch = () => {
  const client = useApolloClient();
  const cacheUtils = useCacheUtils();
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      const query = `
        query {
          books {
            id
            title
            author
          }
        }
      `;
      const variables = {};
      if (cacheUtils.isValidCache(query, variables)) {
        const cachedData = cacheUtils.getFromCache(query, variables);
        setBooks(cachedData);
      } else {
        const response = await client.query({
          query,
          variables,
        });
        cacheUtils.setInCache(query, variables, response.data.books);
        setBooks(response.data.books);
      }
    };
    fetchBooks();
  }, [query, client, cacheUtils]);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = `
      query {
        books(search: "${query}") {
          id
          title
          author
        }
      }
    `;
    const variables = { search: query };
    if (cacheUtils.isValidCache(query, variables)) {
      const cachedData = cacheUtils.getFromCache(query, variables);
      setBooks(cachedData);
    } else {
      const response = await client.query({
        query,
        variables,
      });
      cacheUtils.setInCache(query, variables, response.data.books);
      setBooks(response.data.books);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} />
        <button type="submit">Search</button>
      </form>
      <ul>
        {books.map((book) => (
          <li key={book.id}>{book.title} by {book.author}</li>
        ))}
      </ul>
    </div>
  );
};

export default BookSearch;
``}
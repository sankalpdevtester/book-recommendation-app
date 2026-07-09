// src/utils/cacheUtils.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { Cache } from 'apollo-cache-inmemory';
import { getCache } from './cache';

interface CacheOptions {
  ttl: number;
}

const cacheUtils = {
  /**
   * Get the Apollo Client cache instance
   */
  getCache: () => {
    return getCache();
  },

  /**
   * Clear the entire cache
   */
  clearCache: () => {
    const cache = cacheUtils.getCache();
    cache.reset();
  },

  /**
   * Remove a specific item from the cache
   * @param key The cache key to remove
   */
  removeItemFromCache: (key: string) => {
    const cache = cacheUtils.getCache();
    cache.evict({ fieldName: key });
  },

  /**
   * Add a new item to the cache with a TTL (time to live)
   * @param key The cache key
   * @param value The value to cache
   * @param options Cache options (e.g. TTL)
   */
  addItemToCache: (key: string, value: any, options: CacheOptions) => {
    const cache = cacheUtils.getCache();
    cache.writeQuery({
      query: key,
      data: value,
      metadata: {
        ttl: options.ttl,
      },
    });
  },

  /**
   * Get a cached item by key
   * @param key The cache key
   */
  getCachedItem: (key: string) => {
    const cache = cacheUtils.getCache();
    return cache.readQuery({ query: key });
  },

  /**
   * Check if a cache item is expired
   * @param key The cache key
   */
  isCacheItemExpired: (key: string) => {
    const cache = cacheUtils.getCache();
    const item = cache.readQuery({ query: key });
    if (!item) return true;
    const metadata = cache.getMetadata(key);
    if (!metadata) return true;
    const ttl = metadata.ttl;
    if (!ttl) return true;
    const now = new Date().getTime();
    const expiresAt = item.timestamp + ttl * 1000;
    return now > expiresAt;
  },
};

export default cacheUtils;
```
```typescript
// src/pages/BookSearch.tsx (example usage)
import React, { useState, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import cacheUtils from '../utils/cacheUtils';

const BookSearch = () => {
  const client = useApolloClient();
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const cachedResults = cacheUtils.getCachedItem(`searchResults:${searchQuery}`);
    if (cachedResults) {
      setSearchResults(cachedResults);
    } else {
      client.query({
        query: SEARCH_BOOKS_QUERY,
        variables: { query: searchQuery },
      })
        .then((result) => {
          setSearchResults(result.data.searchBooks);
          cacheUtils.addItemToCache(`searchResults:${searchQuery}`, result.data.searchBooks, { ttl: 60 });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [searchQuery, client]);

  return (
    <div>
      <input
        type="search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search for books"
      />
      <ul>
        {searchResults.map((book) => (
          <li key={book.id}>{book.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default BookSearch;
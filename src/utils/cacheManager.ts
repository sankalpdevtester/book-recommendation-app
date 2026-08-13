// src/utils/cacheManager.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';

interface CacheItem {
  data: any;
  ttl: number;
  expiresAt: number;
}

class CacheManager {
  private cache: { [key: string]: CacheItem };
  private apolloClient: ApolloClient<any>;

  constructor(apolloClient: ApolloClient<any>) {
    this.cache = {};
    this.apolloClient = apolloClient;
  }

  public getCacheKey(query: string, variables: any): string {
    return `${query}-${JSON.stringify(variables)}`;
  }

  public get(query: string, variables: any): any {
    const cacheKey = this.getCacheKey(query, variables);
    const cacheItem = this.cache[cacheKey];

    if (!cacheItem) {
      return null;
    }

    if (cacheItem.expiresAt < Date.now()) {
      delete this.cache[cacheKey];
      return null;
    }

    return cacheItem.data;
  }

  public set(query: string, variables: any, data: any, ttl: number = 60 * 1000): void {
    const cacheKey = this.getCacheKey(query, variables);
    const cacheItem: CacheItem = {
      data,
      ttl,
      expiresAt: Date.now() + ttl,
    };

    this.cache[cacheKey] = cacheItem;
  }

  public invalidate(query: string, variables: any): void {
    const cacheKey = this.getCacheKey(query, variables);
    delete this.cache[cacheKey];
  }

  public clear(): void {
    this.cache = {};
  }
}

const cacheManager = new CacheManager(new ApolloClient({
  cache: new InMemoryCache(),
}));

export default cacheManager;
``}

```typescript
// src/apollo-client.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
import cacheManager from './utils/cacheManager';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  fetchOptions: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
  },
});

cacheManager.apolloClient = client;

export default client;
``}

```typescript
// src/pages/BookSearch.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import cacheManager from '../utils/cacheManager';

const BOOK_SEARCH_QUERY = gql`
  query BookSearch($query: String!) {
    bookSearch(query: $query) {
      id
      title
      author
    }
  }
`;

const BookSearch = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { data, loading, error } = useQuery(BOOK_SEARCH_QUERY, {
    variables: { query },
    skip: !query,
  });

  useEffect(() => {
    if (data) {
      cacheManager.set(BOOK_SEARCH_QUERY.loc.source.body, { query }, data);
      setSearchResults(data.bookSearch);
    }
  }, [data]);

  const handleSearch = async () => {
    const cachedResult = cacheManager.get(BOOK_SEARCH_QUERY.loc.source.body, { query });
    if (cachedResult) {
      setSearchResults(cachedResult.bookSearch);
    } else {
      await client.query({
        query: BOOK_SEARCH_QUERY,
        variables: { query },
      });
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search books"
      />
      <button onClick={handleSearch}>Search</button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {searchResults.map((book) => (
            <li key={book.id}>{book.title} by {book.author}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookSearch;
``}
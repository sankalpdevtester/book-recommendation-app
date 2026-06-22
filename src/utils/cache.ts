// src/utils/cache.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { Book } from '../server/models/Book';
import { User } from '../server/models/User';

interface CacheConfig {
  ttl: number;
}

class Cache {
  private cache: InMemoryCache;
  private ttl: number;

  constructor(config: CacheConfig) {
    this.cache = new InMemoryCache();
    this.ttl = config.ttl;
  }

  async get(key: string): Promise<any> {
    const cachedResponse = await this.cache.restore();
    if (cachedResponse && cachedResponse[key]) {
      return cachedResponse[key];
    }
    return null;
  }

  async set(key: string, value: any): Promise<void> {
    await this.cache.persist({
      [key]: value,
    });
    setTimeout(async () => {
      await this.cache.evict({ fieldName: key });
    }, this.ttl);
  }

  async evict(key: string): Promise<void> {
    await this.cache.evict({ fieldName: key });
  }
}

const cacheConfig: CacheConfig = {
  ttl: 30000, // 30 seconds
};

const cache = new Cache(cacheConfig);

export async function getBookFromCache(bookId: string): Promise<Book | null> {
  const cachedBook = await cache.get(`book:${bookId}`);
  if (cachedBook) {
    return cachedBook;
  }
  return null;
}

export async function setBookInCache(book: Book): Promise<void> {
  await cache.set(`book:${book.id}`, book);
}

export async function getUserFromCache(userId: string): Promise<User | null> {
  const cachedUser = await cache.get(`user:${userId}`);
  if (cachedUser) {
    return cachedUser;
  }
  return null;
}

export async function setUserInCache(user: User): Promise<void> {
  await cache.set(`user:${user.id}`, user);
}

export default cache;
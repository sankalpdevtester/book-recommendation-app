import { getRepository } from 'typeorm';
import { Book } from '../models/Book';

class SearchService {
  async searchBooks(query: string, limit: number, offset: number): Promise<[Book[], number]> {
    const bookRepository = getRepository(Book);
    const [books, count] = await bookRepository
      .createQueryBuilder('book')
      .where('book.title LIKE :query OR book.author LIKE :query', {
        query: `%${query}%`,
      })
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return [books, count];
  }
}

export default SearchService;
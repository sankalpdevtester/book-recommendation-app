import { Injectable } from 'type-graphql';
import { Book } from '../models/Book';
import { User } from '../models/User';
import { getRepository } from 'typeorm';
import { BookRepository } from '../repositories/BookRepository';
import { UserRepository } from '../repositories/UserRepository';

@Injectable()
export class RecommendationService {
  private bookRepository: BookRepository;
  private userRepository: UserRepository;

  constructor() {
    this.bookRepository = getRepository(Book).extend(BookRepository);
    this.userRepository = getRepository(User).extend(UserRepository);
  }

  async getRecommendations(userId: string): Promise<Book[]> {
    try {
      const user = await this.userRepository.findOne(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const readBooks = await this.bookRepository.find({
        where: { readers: { id: userId } },
      });

      const recommendedBooks = await this.bookRepository.find({
        where: {
          genres: { $in: user.preferredGenres },
          authors: { $in: user.preferredAuthors },
        },
        take: 10,
      });

      return recommendedBooks;
    } catch (error) {
      throw error;
    }
  }

  async addReadBook(userId: string, bookId: string): Promise<Book> {
    try {
      const user = await this.userRepository.findOne(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const book = await this.bookRepository.findOne(bookId);
      if (!book) {
        throw new Error('Book not found');
      }

      user.readBooks.push(book);
      await this.userRepository.save(user);

      return book;
    } catch (error) {
      throw error;
    }
  }

  async getReadBooks(userId: string): Promise<Book[]> {
    try {
      const readBooks = await this.bookRepository.find({
        where: { readers: { id: userId } },
      });

      return readBooks;
    } catch (error) {
      throw error;
    }
  }
}
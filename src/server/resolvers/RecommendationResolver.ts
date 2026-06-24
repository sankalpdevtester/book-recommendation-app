import { Arg, Resolver, Query, Mutation, FieldResolver, Root } from 'type-graphql';
import { Book } from '../models/Book';
import { User } from '../models/User';
import { getRepository } from 'typeorm';
import { BookRepository } from '../repositories/BookRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ApolloError } from 'apollo-server-errors';

@Resolver(() => Book)
export class RecommendationResolver {
  private bookRepository: BookRepository;
  private userRepository: UserRepository;

  constructor() {
    this.bookRepository = getRepository(Book).extend(BookRepository);
    this.userRepository = getRepository(User).extend(UserRepository);
  }

  @Query(() => [Book])
  async getRecommendations(@Arg('userId', () => String) userId: string): Promise<Book[]> {
    try {
      const user = await this.userRepository.findOne(userId);
      if (!user) {
        throw new ApolloError('User not found', '404');
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
      throw new ApolloError(error.message, '500');
    }
  }

  @Mutation(() => Book)
  async addReadBook(@Arg('userId', () => String) userId: string, @Arg('bookId', () => String) bookId: string): Promise<Book> {
    try {
      const user = await this.userRepository.findOne(userId);
      if (!user) {
        throw new ApolloError('User not found', '404');
      }

      const book = await this.bookRepository.findOne(bookId);
      if (!book) {
        throw new ApolloError('Book not found', '404');
      }

      user.readBooks.push(book);
      await this.userRepository.save(user);

      return book;
    } catch (error) {
      throw new ApolloError(error.message, '500');
    }
  }

  @FieldResolver(() => [Book])
  async readBooks(@Root() user: User): Promise<Book[]> {
    try {
      const readBooks = await this.bookRepository.find({
        where: { readers: { id: user.id } },
      });

      return readBooks;
    } catch (error) {
      throw new ApolloError(error.message, '500');
    }
  }
}
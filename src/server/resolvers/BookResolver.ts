import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { Book } from '../models/Book';
import { BookService } from '../services/BookService';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/GqlAuthGuard';
import { CurrentUser } from '../decorators/CurrentUser';

@Resolver()
export class BookResolver {
  constructor(private readonly bookService: BookService) {}

  @Query(() => [Book])
  async books(): Promise<Book[]> {
    return this.bookService.findAll();
  }

  @Query(() => Book)
  async book(@Args('id', { type: () => Int }) id: number): Promise<Book> {
    return this.bookService.findOne(id);
  }

  @Mutation(() => Book)
  @UseGuards(GqlAuthGuard)
  async createBook(
    @Args('title') title: string,
    @Args('author') author: string,
    @Args('description') description: string,
    @Args('publicationDate') publicationDate: Date,
    @Args('genres', { type: () => [String] }) genres: string[],
    @CurrentUser() user: any,
    @Context() context: any,
  ): Promise<Book> {
    return this.bookService.create({
      title,
      author,
      description,
      publicationDate,
      genres,
      userId: user.id,
    });
  }

  @Mutation(() => Book)
  @UseGuards(GqlAuthGuard)
  async updateBook(
    @Args('id', { type: () => Int }) id: number,
    @Args('title') title: string,
    @Args('author') author: string,
    @Args('description') description: string,
    @Args('publicationDate') publicationDate: Date,
    @Args('genres', { type: () => [String] }) genres: string[],
    @CurrentUser() user: any,
    @Context() context: any,
  ): Promise<Book> {
    return this.bookService.update(id, {
      title,
      author,
      description,
      publicationDate,
      genres,
      userId: user.id,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteBook(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: any,
    @Context() context: any,
  ): Promise<boolean> {
    return this.bookService.delete(id);
  }
}
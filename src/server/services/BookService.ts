import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../models/Book';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find();
  }

  async findOne(id: number): Promise<Book> {
    return this.bookRepository.findOne(id);
  }

  async create(book: Partial<Book>): Promise<Book> {
    const newBook = this.bookRepository.create(book);
    return this.bookRepository.save(newBook);
  }

  async update(id: number, book: Partial<Book>): Promise<Book> {
    await this.bookRepository.update(id, book);
    return this.bookRepository.findOne(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.bookRepository.delete(id);
    return result.affected === 1;
  }
}
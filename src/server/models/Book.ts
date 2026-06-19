import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Book {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  author: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  publicationDate: Date;

  @Field(() => [String])
  @Column('text', { array: true })
  genres: string[];

  @Field(() => Int)
  @Column()
  rating: number;

  @Field(() => Int)
  @Column()
  reviewsCount: number;

  constructor(partial: Partial<Book>) {
    Object.assign(this, partial);
  }
}
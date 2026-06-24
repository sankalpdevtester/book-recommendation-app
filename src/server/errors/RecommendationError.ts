import { ApolloError } from 'apollo-server-errors';

export class RecommendationError extends ApolloError {
  constructor(message: string, code: string) {
    super(message, code);
    this.name = 'RecommendationError';
  }
}

export class BookNotFoundError extends RecommendationError {
  constructor() {
    super('Book not found', '404');
  }
}

export class UserNotFoundError extends RecommendationError {
  constructor() {
    super('User not found', '404');
  }
}

export class InvalidInputError extends RecommendationError {
  constructor() {
    super('Invalid input', '400');
  }
}
// src/utils/bookRecommendationAlgorithm.ts
import { Book } from '../server/models/Book';
import { User } from '../server/models/User';
import { ApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';

// Define the book recommendation algorithm interface
interface BookRecommendationAlgorithm {
  recommendBooks: (user: User, numRecommendations: number) => Promise<Book[]>;
}

// Implement the book recommendation algorithm
class BookRecommendationAlgorithmImpl implements BookRecommendationAlgorithm {
  private apolloClient: ApolloClient<any>;

  constructor(apolloClient: ApolloClient<any>) {
    this.apolloClient = apolloClient;
  }

  async recommendBooks(user: User, numRecommendations: number): Promise<Book[]> {
    // Get the user's reading history and preferences
    const readingHistory = await this.getUserReadingHistory(user.id);
    const preferences = await this.getUserPreferences(user.id);

    // Calculate the similarity between the user's reading history and the book database
    const bookSimilarities = await this.calculateBookSimilarities(readingHistory, preferences);

    // Get the top N book recommendations based on the similarity scores
    const recommendedBooks = await this.getTopRecommendedBooks(bookSimilarities, numRecommendations);

    return recommendedBooks;
  }

  private async getUserReadingHistory(userId: string): Promise<string[]> {
    const query = gql`
      query GetUserReadingHistory($userId: String!) {
        user(id: $userId) {
          readingHistory
        }
      }
    `;

    const result = await this.apolloClient.query({
      query,
      variables: { userId },
    });

    return result.data.user.readingHistory;
  }

  private async getUserPreferences(userId: string): Promise<string[]> {
    const query = gql`
      query GetUserPreferences($userId: String!) {
        user(id: $userId) {
          preferences
        }
      }
    `;

    const result = await this.apolloClient.query({
      query,
      variables: { userId },
    });

    return result.data.user.preferences;
  }

  private async calculateBookSimilarities(readingHistory: string[], preferences: string[]): Promise<{ [bookId: string]: number }> {
    const bookSimilarities: { [bookId: string]: number } = {};

    // Calculate the similarity between the user's reading history and the book database
    // For simplicity, we'll use a simple cosine similarity metric
    for (const book of readingHistory) {
      const bookVector = await this.getBookVector(book);
      const userVector = await this.getUserVector(preferences);

      const similarity = this.cosineSimilarity(bookVector, userVector);
      bookSimilarities[book] = similarity;
    }

    return bookSimilarities;
  }

  private async getBookVector(bookId: string): Promise<number[]> {
    const query = gql`
      query GetBookVector($bookId: String!) {
        book(id: $bookId) {
          vector
        }
      }
    `;

    const result = await this.apolloClient.query({
      query,
      variables: { bookId },
    });

    return result.data.book.vector;
  }

  private async getUserVector(preferences: string[]): Promise<number[]> {
    const userVector: number[] = [];

    // Calculate the user vector based on their preferences
    for (const preference of preferences) {
      const preferenceVector = await this.getPreferenceVector(preference);
      userVector.push(...preferenceVector);
    }

    return userVector;
  }

  private async getPreferenceVector(preference: string): Promise<number[]> {
    const query = gql`
      query GetPreferenceVector($preference: String!) {
        preference(preference: $preference) {
          vector
        }
      }
    `;

    const result = await this.apolloClient.query({
      query,
      variables: { preference },
    });

    return result.data.preference.vector;
  }

  private cosineSimilarity(vector1: number[], vector2: number[]): number {
    const dotProduct = vector1.reduce((acc, val, idx) => acc + val * vector2[idx], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((acc, val) => acc + val ** 2, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((acc, val) => acc + val ** 2, 0));

    return dotProduct / (magnitude1 * magnitude2);
  }

  private async getTopRecommendedBooks(bookSimilarities: { [bookId: string]: number }, numRecommendations: number): Promise<Book[]> {
    const sortedBookSimilarities = Object.keys(bookSimilarities).sort((a, b) => bookSimilarities[b] - bookSimilarities[a]);

    const recommendedBooks: Book[] = [];

    for (const bookId of sortedBookSimilarities.slice(0, numRecommendations)) {
      const book = await this.getBook(bookId);
      recommendedBooks.push(book);
    }

    return recommendedBooks;
  }

  private async getBook(bookId: string): Promise<Book> {
    const query = gql`
      query GetBook($bookId: String!) {
        book(id: $bookId) {
          id
          title
          author
        }
      }
    `;

    const result = await this.apolloClient.query({
      query,
      variables: { bookId },
    });

    return result.data.book;
  }
}

export default BookRecommendationAlgorithmImpl;
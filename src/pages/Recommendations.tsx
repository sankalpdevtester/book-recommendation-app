import React, { useState, useEffect } from 'react';
import { useApolloClient, useQuery, gql } from '@apollo/client';
import { Book } from '../server/models/Book';
import { User } from '../server/models/User';

const GET_RECOMMENDATIONS = gql`
  query GetRecommendations($userId: String!) {
    getRecommendations(userId: $userId) {
      id
      title
      author
      genre
    }
  }
`;

const GET_READ_BOOKS = gql`
  query GetReadBooks($userId: String!) {
    user(id: $userId) {
      readBooks {
        id
        title
        author
        genre
      }
    }
  }
`;

const Recommendations = () => {
  const [userId, setUserId] = useState('');
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [readBooks, setReadBooks] = useState<Book[]>([]);
  const client = useApolloClient();

  const { data, error, loading } = useQuery(GET_RECOMMENDATIONS, {
    variables: { userId },
  });

  const { data: readData, error: readError, loading: readLoading } = useQuery(GET_READ_BOOKS, {
    variables: { userId },
  });

  useEffect(() => {
    if (data) {
      setRecommendations(data.getRecommendations);
    }
  }, [data]);

  useEffect(() => {
    if (readData) {
      setReadBooks(readData.user.readBooks);
    }
  }, [readData]);

  const handleAddReadBook = async (bookId: string) => {
    try {
      const response = await client.mutate({
        mutation: gql`
          mutation AddReadBook($userId: String!, $bookId: String!) {
            addReadBook(userId: $userId, bookId: $bookId) {
              id
              title
              author
              genre
            }
          }
        `,
        variables: { userId, bookId },
      });

      setReadBooks([...readBooks, response.data.addReadBook]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Recommendations</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {recommendations.map((book) => (
            <li key={book.id}>
              {book.title} by {book.author}
              <button onClick={() => handleAddReadBook(book.id)}>Add to Read</button>
            </li>
          ))}
        </ul>
      )}
      <h2>Read Books</h2>
      {readLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {readBooks.map((book) => (
            <li key={book.id}>
              {book.title} by {book.author}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Recommendations;
import React, { useState, useEffect } from 'react';
import { useApolloClient, useQuery, gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';

const SEARCH_BOOKS = gql`
  query SearchBooks($query: String!, $limit: Int, $offset: Int) {
    searchBooks(query: $query, limit: $limit, offset: $offset) {
      books {
        id
        title
        author
        coverUrl
      }
      totalCount
    }
  }
`;

interface SearchResultsProps {
  query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query }) => {
  const client = useApolloClient();
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const { data, loading, error } = useQuery(SEARCH_BOOKS, {
    variables: { query, limit, offset },
  });

  const handlePageChange = (page: number) => {
    setOffset(page * limit);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const books = data.searchBooks.books;
  const totalCount = data.searchBooks.totalCount;

  return (
    <div>
      <h1>Search Results for "{query}"</h1>
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <Link to={`/books/${book.id}`}>
              <BookCard book={book} />
            </Link>
          </li>
        ))}
      </ul>
      <div>
        {Math.ceil(totalCount / limit) > 1 && (
          <button onClick={() => handlePageChange(offset / limit - 1)}>
            Previous
          </button>
        )}
        {Array(Math.ceil(totalCount / limit))
          .fill(0)
          .map((_, index) => (
            <button key={index} onClick={() => handlePageChange(index)}>
              {index + 1}
            </button>
          ))}
        {Math.ceil(totalCount / limit) > 1 && (
          <button onClick={() => handlePageChange(offset / limit + 1)}>
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';

const BOOK_SEARCH_QUERY = gql`
  query BookSearch($query: String!) {
    books(query: $query) {
      id
      title
      author
    }
  }
`;

function BookSearch() {
  const [query, setQuery] = useState('');
  const { data, error, loading } = useQuery(BOOK_SEARCH_QUERY, {
    variables: { query },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>
        {data.books.map((book) => (
          <li key={book.id}>
            {book.title} by {book.author}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BookSearch;
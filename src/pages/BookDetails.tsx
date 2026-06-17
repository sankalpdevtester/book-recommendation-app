import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

const BOOK_DETAILS_QUERY = gql`
  query BookDetails($id: ID!) {
    book(id: $id) {
      id
      title
      author
      description
    }
  }
`;

function BookDetails() {
  const { id } = useParams();
  const { data, error, loading } = useQuery(BOOK_DETAILS_QUERY, {
    variables: { id },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>{data.book.title}</h1>
      <p>Author: {data.book.author}</p>
      <p>Description: {data.book.description}</p>
    </div>
  );
}

export default BookDetails;
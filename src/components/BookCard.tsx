import React from 'react';

interface BookCardProps {
  book: {
    id: number;
    title: string;
    author: string;
    coverUrl: string;
  };
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <div>
      <img src={book.coverUrl} alt={book.title} />
      <h2>{book.title}</h2>
      <p>By {book.author}</p>
    </div>
  );
};

export default BookCard;
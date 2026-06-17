import { gql } from 'graphql-tag';

const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    author: String!
    description: String
  }

  type Query {
    books(query: String!): [Book]
    book(id: ID!): Book
  }
`;

const resolvers = {
  Query: {
    books: async (parent, { query }) => {
      // Implement book search logic here
      return [
        { id: '1', title: 'Book 1', author: 'Author 1' },
        { id: '2', title: 'Book 2', author: 'Author 2' },
      ];
    },
    book: async (parent, { id }) => {
      // Implement book details logic here
      return { id, title: 'Book Title', author: 'Author Name', description: 'Book description' };
    },
  },
};

export const schema = {
  typeDefs,
  resolvers,
};
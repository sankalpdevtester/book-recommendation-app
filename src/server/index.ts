import { createServer } from '@graphql-yoga/core';
import { schema } from './schema';

const server = createServer({
  schema,
  port: 4000,
});

server.start(() => console.log('Server started on port 4000'));
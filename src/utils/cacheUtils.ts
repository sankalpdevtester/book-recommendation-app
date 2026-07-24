// src/utils/cacheUtils.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { Cache } from 'apollo-cache-inmemory';
import { User } from '../server/models/User';

interface CacheUtils {
  getCache: () => InMemoryCache;
  clearCache: () => void;
  cacheUser: (user: User) => void;
  clearUserCache: () => void;
}

const cacheUtils: CacheUtils = {
  getCache: () => {
    const client = new ApolloClient({
      uri: 'http://localhost:4000/graphql',
      cache: new InMemoryCache(),
    });
    return client.cache;
  },

  clearCache: () => {
    const cache = cacheUtils.getCache();
    cache.reset();
  },

  cacheUser: (user: User) => {
    const cache = cacheUtils.getCache();
    cache.writeQuery({
      query: gql`
        query GetUser {
          user {
            id
            name
            email
          }
        }
      `,
      data: {
        user,
      },
    });
  },

  clearUserCache: () => {
    const cache = cacheUtils.getCache();
    cache.writeQuery({
      query: gql`
        query GetUser {
          user {
            id
            name
            email
          }
        }
      `,
      data: {
        user: null,
      },
    });
  },
};

export default cacheUtils;
``}

```typescript
// src/apollo-client.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
import cacheUtils from './utils/cacheUtils';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

cacheUtils.getCache();

export default client;
``}

```typescript
// src/server/services/UserService.ts
import cacheUtils from '../utils/cacheUtils';

class UserService {
  async getUser(id: string) {
    const user = await User.findById(id);
    cacheUtils.cacheUser(user);
    return user;
  }

  async clearUserCache() {
    cacheUtils.clearUserCache();
  }
}

export default UserService;
``}

```typescript
// src/pages/Login.tsx
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import cacheUtils from '../utils/cacheUtils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login] = useMutation(LOGIN_MUTATION);

  const handleLogin = async () => {
    try {
      const response = await login({
        variables: {
          email,
          password,
        },
      });
      cacheUtils.cacheUser(response.data.login.user);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
``}
import { Arg, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';
import { User } from 'src/server/models/User';
import { UserService } from 'src/server/services/UserService';
import { AuthService } from 'src/server/services/AuthService';
import { RegisterInput } from 'src/server/dto/RegisterInput';
import { LoginInput } from 'src/server/dto/LoginInput';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  @Query(() => User, { nullable: true })
  async me(@Arg('token') token: string) {
    try {
      const user = await this.authService.verifyToken(token);
      return user;
    } catch (error) {
      throw new ApolloError('Invalid token', 'INVALID_TOKEN');
    }
  }

  @Mutation(() => User)
  async register(@Arg('input') input: RegisterInput) {
    try {
      const user = await this.userService.createUser(input);
      return user;
    } catch (error) {
      throw new ApolloError('User already exists', 'USER_ALREADY_EXISTS');
    }
  }

  @Mutation(() => String)
  async login(@Arg('input') input: LoginInput) {
    try {
      const token = await this.authService.login(input);
      return token;
    } catch (error) {
      throw new ApolloError('Invalid credentials', 'INVALID_CREDENTIALS');
    }
  }
}
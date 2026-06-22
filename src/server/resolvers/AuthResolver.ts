import { Arg, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from '../services/UserService';
import { LoginInput } from '../dto/LoginInput';
import { RegisterInput } from '../dto/RegisterInput';
import { User } from '../models/User';
import { AuthService } from '../services/AuthService';

@Resolver()
export class AuthResolver {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  @Mutation('login')
  async login(@Arg('loginInput') loginInput: LoginInput): Promise<{ token: string; user: User }> {
    const user = await this.userService.findOne({ email: loginInput.email });
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const isValidPassword = await this.authService.validatePassword(loginInput.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }
    const token = await this.authService.generateToken(user);
    return { token, user };
  }

  @Mutation('register')
  async register(@Arg('registerInput') registerInput: RegisterInput): Promise<{ token: string; user: User }> {
    const existingUser = await this.userService.findOne({ email: registerInput.email });
    if (existingUser) {
      throw new Error('Email already in use');
    }
    const hashedPassword = await this.authService.hashPassword(registerInput.password);
    const user = await this.userService.create({ ...registerInput, password: hashedPassword });
    const token = await this.authService.generateToken(user);
    return { token, user };
  }

  @Query('me')
  async me(@Arg('token') token: string): Promise<User | null> {
    const user = await this.authService.verifyToken(token);
    return user;
  }
}
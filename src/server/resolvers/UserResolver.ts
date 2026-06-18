import { Arg, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '../models/User';
import { UserService } from '../services/UserService';
import { AuthService } from '../services/AuthService';
import { LoginInput } from '../inputs/LoginInput';
import { RegisterInput } from '../inputs/RegisterInput';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  @Query(() => User, { nullable: true })
  async me(@Arg('token') token: string): Promise<User | null> {
    if (!token) return null;
    const user = await this.authService.verifyToken(token);
    return user;
  }

  @Mutation(() => User)
  async login(@Arg('loginInput') loginInput: LoginInput): Promise<User> {
    const user = await this.userService.findByEmail(loginInput.email);
    if (!user || !(await this.authService.comparePasswords(loginInput.password, user.password))) {
      throw new Error('Invalid email or password');
    }
    const token = await this.authService.generateToken(user);
    return { ...user, token };
  }

  @Mutation(() => User)
  async register(@Arg('registerInput') registerInput: RegisterInput): Promise<User> {
    const existingUser = await this.userService.findByEmail(registerInput.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }
    const hashedPassword = await this.authService.hashPassword(registerInput.password);
    const user = await this.userService.create({ ...registerInput, password: hashedPassword });
    const token = await this.authService.generateToken(user);
    return { ...user, token };
  }
}
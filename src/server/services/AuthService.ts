import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { UserService } from './UserService';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async generateToken(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = jwt.verify(token, process.env.SECRET_KEY) as { sub: string; email: string };
      const user = await this.userService.findOne({ id: payload.sub });
      return user;
    } catch (error) {
      return null;
    }
  }
}
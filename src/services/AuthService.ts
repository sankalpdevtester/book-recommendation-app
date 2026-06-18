import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from '../models/User';

@Injectable()
export class AuthService {
  private readonly secretKey = process.env.SECRET_KEY;

  async generateToken(user: User): Promise<string> {
    const payload = { id: user.id, email: user.email };
    return jwt.sign(payload, this.secretKey, { expiresIn: '1h' });
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = jwt.verify(token, this.secretKey) as { id: number; email: string };
      return await User.findOneBy({ id: payload.id });
    } catch (error) {
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
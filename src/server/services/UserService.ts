import { Injectable } from '@nestjs/common';
import { User } from 'src/server/models/User';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(input: any) {
    const user = this.userRepository.create(input);
    return this.userRepository.save(user);
  }

  async getUser(id: number) {
    return this.userRepository.findOne(id);
  }

  async getUsers() {
    return this.userRepository.find();
  }

  async updateUser(id: number, input: any) {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error('User not found');
    }
    Object.assign(user, input);
    return this.userRepository.save(user);
  }

  async deleteUser(id: number) {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error('User not found');
    }
    return this.userRepository.remove(user);
  }
}
import type { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import UserRepository from '../repositories/UserRepository.js';
import { User } from '../generated/prisma/client.js';
import { HttpException } from '../utils/httpException.js';

const userRepository = new UserRepository();

export default class UserService {
  private userRepository: UserRepository;
  constructor() {
    this.userRepository = userRepository;
  }

  async findAll() {
    return await userRepository.findAll();
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id)
    if (!user) throw new HttpException(404, "User tidak ditemukan")
    return user;
  }

  async findByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  async findByKey(key: keyof Prisma.UserWhereInput, value: Prisma.UserWhereInput[typeof key]) {
    return await this.userRepository.findByKey(key, value);
  }

  async create(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    return await this.userRepository.create({...data, password: hashedPassword});
  }

  async update(id: string, data: any) {
    await this.findById(id);
    if (data.password)
      data.password = await bcrypt.hash(data.password, 10)
    return await this.userRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id)
    await this.userRepository.delete(id);
  }
}

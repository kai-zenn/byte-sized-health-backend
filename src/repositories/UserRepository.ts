import prisma from "../configs/prismaConf.js";
import type { Prisma } from "@prisma/client";

export default class UserRepository {
  private readonly prisma = prisma;
  constructor() {
    this.prisma = prisma;
  }

  async findAll() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async findByKey(key: keyof Prisma.UserWhereInput, value: Prisma.UserWhereInput[keyof Prisma.UserWhereInput]) {
      return await this.prisma.user.findFirst({ where: { [key]: value } });
  }

  async create(user: Prisma.UserCreateInput) {
    return await this.prisma.user.create({ data: user });
  }

  async update(id: string, user: Prisma.UserUpdateInput) {
    return await  this.prisma.user.update({ where: { id }, data: user });
  }

  async delete(id: string) {
    return await this.prisma.user.delete({ where: { id } });
  }
}

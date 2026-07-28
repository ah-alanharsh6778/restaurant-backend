const prisma = require('../../config/prisma');

class AuthRepository {
  async findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
  }

  async findUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });
  }

  async findRoleById(id) {
    return prisma.role.findUnique({
      where: { id }
    });
  }

  async createUserWithStaff(userData, staffData) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          ...userData,
          staff: staffData ? { create: staffData } : undefined
        },
        include: { role: true, staff: true }
      });
      return user;
    });
  }

  async createRefreshToken(data) {
    return prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token }
    });
  }

  async revokeRefreshToken(token) {
    return prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true }
    });
  }
}

module.exports = new AuthRepository();

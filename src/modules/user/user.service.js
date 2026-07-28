const prisma = require('../../config/prisma');
const { NotFoundError } = require('../../utils/errors');
const { UserDTO } = require('../../dtos');

const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  if (!user) {
    throw new NotFoundError('User profile not found');
  }

  return new UserDTO(user);
};

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: 'desc' }
  });

  return users.map((u) => new UserDTO(u));
};

module.exports = {
  getUserProfile,
  getAllUsers
};

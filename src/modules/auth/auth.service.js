const bcrypt = require('bcrypt');
const prisma = require('../../config/prisma');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../../utils/errors');
const { UserDTO } = require('../../dtos');

const registerUser = async (userData) => {
  const { fullName, email, password, phone, roleId } = userData;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new BadRequestError('Email already registered');
  }

  let role = null;
  if (roleId) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roleId);
    if (isUuid) {
      role = await prisma.role.findUnique({ where: { id: roleId } });
    }
    if (!role) {
      role = await prisma.role.findFirst({
        where: {
          name: String(roleId).toUpperCase().trim()
        }
      });
    }
  }

  if (!role) {
    role = await prisma.role.findFirst({ where: { name: 'WAITER' } }) ||
           await prisma.role.findFirst({ where: { name: 'STAFF' } }) ||
           await prisma.role.findFirst();
  }

  if (!role) {
    throw new NotFoundError('Role not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      phone: phone || null,
      roleId: role.id
    },
    include: {
      role: true
    }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: 'REGISTER',
      module: 'AUTH',
      description: `User ${user.email} registered successfully`
    }
  }).catch(() => {});

  return new UserDTO(user);
};

const loginUser = async (loginData, metadata = {}) => {
  const { email, password } = loginData;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: true
    }
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('User account is deactivated');
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role.name
  };

  const accessToken = generateToken(payload);
  const refreshTokenStr = generateRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Persist RefreshToken and UserSession
  const storedToken = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshTokenStr,
      ipAddress: metadata.ip || null,
      userAgent: metadata.userAgent || null,
      expiresAt
    }
  }).catch(() => null);

  await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshTokenId: storedToken ? storedToken.id : null,
      ipAddress: metadata.ip || null,
      userAgent: metadata.userAgent || null,
      device: metadata.device || 'Web Browser',
      browser: metadata.browser || 'Chrome/Safari/Firefox',
      expiresAt
    }
  }).catch(() => {});

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: 'LOGIN',
      module: 'AUTH',
      description: `User ${user.email} logged in successfully`,
      ipAddress: metadata.ip || null,
      userAgent: metadata.userAgent || null
    }
  }).catch(() => {});

  return {
    accessToken,
    refreshToken: refreshTokenStr,
    user: new UserDTO(user)
  };
};

const refreshAccessToken = async (refreshTokenStr) => {
  const decoded = verifyRefreshToken(refreshTokenStr);

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: { role: true }
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid user or account deactivated');
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role.name
  };

  const newAccessToken = generateToken(payload);
  const newRefreshTokenStr = generateRefreshToken(payload);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshTokenStr
  };
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken
};

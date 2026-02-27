import {
  CreateRefreshTokenRepository,
  DeleteRefreshTokenRepository,
  ValidateRefreshTokenRepository,
} from '@/application/protocols/db';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { PrismaRefreshTokenRepository } from './prisma-refresh-token-repository';

const prismaMock = {
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
} as unknown as PrismaClient;

describe('PrismaRefreshTokenRepository', () => {
  let prismaRefreshTokenRepository: PrismaRefreshTokenRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaRefreshTokenRepository = new PrismaRefreshTokenRepository(prismaMock);
  });

  describe('create', () => {
    it('should create a refresh token successfully', async () => {
      const createParams: CreateRefreshTokenRepository.Params = {
        userId: faker.string.uuid(),
        token: faker.string.alphanumeric(100),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      const mockCreatedToken = {
        id: faker.string.uuid(),
        ...createParams,
        createdAt: new Date(),
      };
      jest.spyOn(prismaMock.refreshToken, 'create').mockResolvedValueOnce(mockCreatedToken as any);

      await prismaRefreshTokenRepository.create(createParams);

      expect(prismaMock.refreshToken.create).toHaveBeenCalledWith({
        data: {
          userId: createParams.userId,
          token: createParams.token,
          expiresAt: createParams.expiresAt,
        },
      });
      expect(prismaMock.refreshToken.create).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors during creation', async () => {
      const createParams: CreateRefreshTokenRepository.Params = {
        userId: faker.string.uuid(),
        token: faker.string.alphanumeric(100),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      const databaseError = new Error('Database connection failed');
      jest.spyOn(prismaMock.refreshToken, 'create').mockRejectedValueOnce(databaseError);

      await expect(prismaRefreshTokenRepository.create(createParams)).rejects.toThrow(databaseError);
    });
  });

  describe('validate', () => {
    it('should return token data when token exists and is not expired', async () => {
      const token = faker.string.alphanumeric(100);
      const validateParams: ValidateRefreshTokenRepository.Params = { token };
      const mockTokenData = {
        id: faker.string.uuid(),
        userId: faker.string.uuid(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      jest.spyOn(prismaMock.refreshToken, 'findUnique').mockResolvedValueOnce(mockTokenData as any);

      const result = await prismaRefreshTokenRepository.validate(validateParams);

      expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token },
        select: {
          id: true,
          userId: true,
          expiresAt: true,
        },
      });
      expect(result).toEqual(mockTokenData);
    });

    it('should return null when token does not exist', async () => {
      const token = faker.string.alphanumeric(100);
      const validateParams: ValidateRefreshTokenRepository.Params = { token };
      jest.spyOn(prismaMock.refreshToken, 'findUnique').mockResolvedValueOnce(null);

      const result = await prismaRefreshTokenRepository.validate(validateParams);

      expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token },
        select: {
          id: true,
          userId: true,
          expiresAt: true,
        },
      });
      expect(result).toBeNull();
    });

    it('should delete expired token and return null', async () => {
      const token = faker.string.alphanumeric(100);
      const validateParams: ValidateRefreshTokenRepository.Params = { token };
      const expiredTokenData = {
        id: faker.string.uuid(),
        userId: faker.string.uuid(),
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      };
      jest.spyOn(prismaMock.refreshToken, 'findUnique').mockResolvedValueOnce(expiredTokenData as any);
      jest.spyOn(prismaMock.refreshToken, 'delete').mockResolvedValueOnce({} as any);

      const result = await prismaRefreshTokenRepository.validate(validateParams);

      expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token },
        select: {
          id: true,
          userId: true,
          expiresAt: true,
        },
      });
      expect(prismaMock.refreshToken.delete).toHaveBeenCalledWith({
        where: { token },
      });
      expect(result).toBeNull();
    });

    it('should handle database errors during validation', async () => {
      const token = faker.string.alphanumeric(100);
      const validateParams: ValidateRefreshTokenRepository.Params = { token };
      const databaseError = new Error('Database connection failed');
      jest.spyOn(prismaMock.refreshToken, 'findUnique').mockRejectedValueOnce(databaseError);

      await expect(prismaRefreshTokenRepository.validate(validateParams)).rejects.toThrow(databaseError);
    });
  });

  describe('delete', () => {
    it('should delete a refresh token successfully', async () => {
      const token = faker.string.alphanumeric(100);
      const deleteParams: DeleteRefreshTokenRepository.Params = { token };
      const mockDeletedToken = {
        id: faker.string.uuid(),
        token,
        userId: faker.string.uuid(),
        expiresAt: new Date(),
        createdAt: new Date(),
      };
      jest.spyOn(prismaMock.refreshToken, 'delete').mockResolvedValueOnce(mockDeletedToken as any);

      await prismaRefreshTokenRepository.delete(deleteParams);

      expect(prismaMock.refreshToken.delete).toHaveBeenCalledWith({
        where: { token },
      });
      expect(prismaMock.refreshToken.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors during deletion', async () => {
      const token = faker.string.alphanumeric(100);
      const deleteParams: DeleteRefreshTokenRepository.Params = { token };
      const databaseError = new Error('Token not found');
      jest.spyOn(prismaMock.refreshToken, 'delete').mockRejectedValueOnce(databaseError);

      await expect(prismaRefreshTokenRepository.delete(deleteParams)).rejects.toThrow(databaseError);
    });

    it('should handle deletion of non-existent token', async () => {
      const token = 'non-existent-token';
      const deleteParams: DeleteRefreshTokenRepository.Params = { token };
      const notFoundError = new Error('Record to delete does not exist');
      jest.spyOn(prismaMock.refreshToken, 'delete').mockRejectedValueOnce(notFoundError);

      await expect(prismaRefreshTokenRepository.delete(deleteParams)).rejects.toThrow(notFoundError);
    });
  });

  describe('integration scenarios', () => {
    it('should handle validate and delete sequence for expired token', async () => {
      const token = faker.string.alphanumeric(100);
      const expiredTokenData = {
        id: faker.string.uuid(),
        userId: faker.string.uuid(),
        expiresAt: new Date(Date.now() - 1000),
      };
      jest.spyOn(prismaMock.refreshToken, 'findUnique').mockResolvedValueOnce(expiredTokenData as any);
      jest.spyOn(prismaMock.refreshToken, 'delete').mockResolvedValueOnce({} as any);

      const result = await prismaRefreshTokenRepository.validate({ token });

      expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.refreshToken.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.refreshToken.delete).toHaveBeenCalledWith({ where: { token } });
      expect(result).toBeNull();
    });

    it('should not delete valid token during validation', async () => {
      const token = faker.string.alphanumeric(100);
      const validTokenData = {
        id: faker.string.uuid(),
        userId: faker.string.uuid(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      jest.spyOn(prismaMock.refreshToken, 'findUnique').mockResolvedValueOnce(validTokenData as any);

      const result = await prismaRefreshTokenRepository.validate({ token });

      expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.refreshToken.delete).not.toHaveBeenCalled();
      expect(result).toEqual(validTokenData);
    });
  });
});

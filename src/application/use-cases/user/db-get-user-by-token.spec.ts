import { faker } from '@faker-js/faker';
import { DbGetUserByToken } from './db-get-user-by-token';

const mockDecrypter = {
  decrypt: jest.fn(),
};

const mockGetUserById = {
  getById: jest.fn(),
};

const makeSut = () => {
  return new DbGetUserByToken(mockDecrypter, mockGetUserById);
};

describe('DbGetUserByToken', () => {
  it('should find an user by token', async () => {
    const sut = makeSut();
    const token = faker.string.uuid();
    const userId = faker.string.uuid();
    const user = {
      id: userId,
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: faker.internet.password(),
    };
    mockDecrypter.decrypt.mockResolvedValue(userId);
    mockGetUserById.getById.mockResolvedValue(user);

    const foundUser = await sut.getByToken({ token });

    expect(foundUser).toEqual(user);
  });

  it('should throw if decrypter throws', async () => {
    const sut = makeSut();
    const token = faker.string.uuid();
    mockDecrypter.decrypt.mockRejectedValue(new Error());

    const promise = sut.getByToken({ token });

    await expect(promise).rejects.toThrow();
  });

  it('should throw if findUserById throws', async () => {
    const sut = makeSut();
    const token = faker.string.uuid();
    const userId = faker.string.uuid();
    mockDecrypter.decrypt.mockResolvedValue(userId);
    mockGetUserById.getById.mockRejectedValue(new Error());

    const promise = sut.getByToken({ token });

    await expect(promise).rejects.toThrow();
  });

  it('should throw if user is not found', async () => {
    const sut = makeSut();
    const token = faker.string.uuid();
    const userId = faker.string.uuid();
    mockDecrypter.decrypt.mockResolvedValue(userId);
    mockGetUserById.getById.mockResolvedValue(null);

    const promise = sut.getByToken({ token });

    await expect(promise).rejects.toThrow();
  });
});

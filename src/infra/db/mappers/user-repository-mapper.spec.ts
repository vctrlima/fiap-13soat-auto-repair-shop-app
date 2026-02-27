import { faker } from '@faker-js/faker';
import { UserRepositoryMapper } from './user-repository-mapper';

describe('UserRepositoryMapper', () => {
  it('should return a mapped user object without password', () => {
    const user = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: 'Default',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = UserRepositoryMapper.dataToEntity(user);

    expect(result).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    expect((result as any).password).toBeUndefined();
  });
});

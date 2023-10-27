import { _ } from 'lodash';
import { UserEntity } from '../../src/user/user.entity';

export const userFixture = (userdata?: Partial<UserEntity>) =>
  _.merge(
    {
      email: 'abc@gmail.com',
      password: 'password',
      name: 'name',
    },
    userdata,
  );

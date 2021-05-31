import { Request } from 'express';
import { User } from '../modules/users/domain/user.entity';

export interface RequestWithUserEntity extends Request {
  user: User;
}

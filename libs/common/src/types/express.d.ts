import { Request } from 'express';
import { RequestUser } from '../auth';

declare module 'express' {
  interface Request {
    user?: RequestUser;
  }
}

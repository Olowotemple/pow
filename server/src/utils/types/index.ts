import DataLoader from 'dataloader';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { Upvote } from '../../entities/Upvote';
import { User } from '../../entities/User';

declare module 'express-session' {
  interface Session {
    userId: number;
  }
}

export interface MyContext {
  req: Request;
  res: Response;
  redis: Redis;
  userLoader: DataLoader<number, User, number>;
  upvoteLoader: DataLoader<
    {
      postId: number;
      userId: number;
    },
    Upvote | null,
    {
      postId: number;
      userId: number;
    }
  >;
}

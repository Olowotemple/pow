import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import http from 'http';
import Redis from 'ioredis';
import path from 'path';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import buildSchema from './graphql/schema';
import { COOKIE_NAME, __prod__ } from './utils/constants';
import createUpvoteLoader from './utils/createUpvoteLoader';
import createUserLoader from './utils/createUserLoader';
import { MyContext } from './utils/types';

const main = async () => {
  const dbConnection = await createConnection({
    type: 'postgres',
    username: 'olowo',
    password: '$123Funmi890',
    database: 'pow',
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, '\\migrations\\**\\*.js')],
    entities: [path.join(__dirname, '\\entities\\**\\*.js')],
  });
  console.log('📚 Connected to PostgreSQL');
  await dbConnection.runMigrations();

  const app = express();
  const httpServer = http.createServer(app);

  app.set('trust proxy', !__prod__);

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 3, // 3 years
        httpOnly: true,
        secure: __prod__, // set to true for Apollo studio
        sameSite: 'lax', // set to 'none' for Apollo Studio
      },
      saveUninitialized: false,
      secret: 'jtueopoknknsndf', // make into environment variable later
      resave: false,
    })
  );

  const server = new ApolloServer({
    schema: await buildSchema,
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      upvoteLoader: createUpvoteLoader(),
    }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({ app, cors: false });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
};

main().catch((err) => console.error(err));

import * as argon2 from 'argon2';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../entities/User';
import {
  COOKIE_NAME,
  EMAIL_REGEX,
  FORGOT_PASSWORD_PREFIX,
} from '../../utils/constants';
import sendEmail from '../../utils/sendEmail';
import { MyContext } from '../../utils/types';

@InputType()
class UserCredentials {
  @Field()
  email: string;
  @Field()
  username: string;
  @Field()
  password: string;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (req.session.userId === user.id) {
      return user.email;
    }

    return 'null';
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext): Promise<User | undefined> | null {
    if (!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('credentials') { username, password, email }: UserCredentials,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    if (!EMAIL_REGEX.test(email)) {
      return {
        errors: [
          {
            field: 'email',
            message: 'invalid email',
          },
        ],
      };
    }

    if (username.length < 3) {
      return {
        errors: [
          {
            field: 'username',
            message: 'length must be greater than 3',
          },
        ],
      };
    }

    if (password.length < 8) {
      return {
        errors: [
          {
            field: 'password',
            message: 'length must be at least 8 characters',
          },
        ],
      };
    }
    const passwordHash = await argon2.hash(password);
    const user = User.create({
      email,
      username,
      password: passwordHash,
    });

    try {
      await user.save();
    } catch (err) {
      /*
        since we switched out MIkroORM for TypeORM
        we need to verify the error code reported for unique violation
      */
      console.log(err);
      // if (err.code === '23505') {
      //   if (err.detail.includes('email')) {
      //     return {
      //       errors: [
      //         {
      //           field: 'email',
      //           message: 'email already taken',
      //         },
      //       ],
      //     };
      //   } else if (err.detail.includes('username')) {
      //     return {
      //       errors: [
      //         {
      //           field: 'username',
      //           message: 'username already taken',
      //         },
      //       ],
      //     };
      //   }
      // }
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('username') username: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: "username doesn't exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext) {
    return await new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          return resolve(false);
        }
        resolve(true);
      })
    );
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return false;
    }

    const token = uuidv4();

    await redis.set(
      `${FORGOT_PASSWORD_PREFIX}${token}`,
      user.id,
      'ex',
      1000 * 60 * 60 * 24
    );

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );
    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { req, redis }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length < 8) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'length must be at least 8 characters',
          },
        ],
      };
    }

    const key = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'token expired',
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne({ where: { id: userIdNum } });

    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'user no longer exists',
          },
        ],
      };
    }

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    );

    // token is only valid for one use only
    await redis.del(key);

    req.session.userId = user.id;

    return { user };
  }
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

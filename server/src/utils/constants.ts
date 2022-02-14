export const __prod__ = process.env.NODE_ENV === 'production';
export const COOKIE_NAME = 'uqu:sessid';
export const EMAIL_REGEX = new RegExp(
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
);
export const FORGOT_PASSWORD_PREFIX = 'forgot-password:';

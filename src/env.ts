import * as dotenv from 'dotenv';
import path from 'path';
import process from 'node:process';

interface Validator {
  (arg: string): boolean;
}

const getOrDefault = (
  e: string,
  def: string,
  validator?: Validator,
): string => {
  const value = process.env[e];
  if (!value) {
    return def;
  }
  const isValid = validator ? validator(value) : true;
  return isValid ? value : def;
};

const getOrThrow = (e: string, message?: string, validator?: Validator) => {
  const value = process.env[e];
  if (!value) {
    throw new Error(message || `The environment variable ${e} is not set.`);
  }
  const isValid = validator ? validator(value) : true;
  if (!isValid) {
    throw new Error(message || `The environment variable ${e} is not valid.`);
  }
  return value;
};

export const LOG_LEVELS = {
  'error': 0,
  'alert': 1,
  'info': 2,
  'debug': 3,
};

const getLogLevel = () => {
  const level = getOrDefault('LOG_LEVEL', 'INFO', (v) =>
    v.toLowerCase() in LOG_LEVELS,
  );
  return level.toLowerCase();
};

export interface DataBaseEnv {
  DATABASE_URL: string;
  TABLE_SYNC: boolean;
  SHOW_SQL: boolean;
}

export interface HttpEnv {
  PORT: number;
}

export interface AppEnv {
  APP_ENV: string;
  LOG_LEVEL: string;
  LOG_DEST: string;
  LOG_FOLDER: string;
  JWT_SECRET: string;
  DEFAULT_USERNAME: string;
  DEFAULT_PASSWORD: string;
  DEFAULT_USER_EMAIL: string;
  LINK_URL_PREFIX: string;
}

export interface SmtpEnv {
  SMTP_HOST: string;
  SMTP_USERNAME: string;
  SMTP_PASSWORD: string;
  SMTP_PORT: number;
  SMTP_MAILER_SOURCE: string;
  LINK_URL_PREFIX: string;
}

interface Env extends DataBaseEnv, HttpEnv, AppEnv, SmtpEnv {}

dotenv.config({
  path: path.join(__dirname, '../.env')
});

const env: Env = {
  DATABASE_URL: getOrDefault('DATABASE_URL', 'sqlite::memory:'),
  PORT: parseInt(getOrDefault('PORT', '3000'), 10),
  APP_ENV: getOrDefault('APP_ENV', 'DEV'),
  LOG_LEVEL: getLogLevel(),
  LOG_DEST: getOrDefault('LOG_DEST', 'file'),
  LOG_FOLDER: getOrDefault('LOG_FOLDER', path.join(__dirname, '../var/log')),
  JWT_SECRET: getOrDefault('JWT_SECRET', 'SOME-SECRET'),
  TABLE_SYNC: getOrDefault('TABLE_SYNC', 'FALSE').toUpperCase() === 'TRUE',
  SHOW_SQL: getOrDefault('SHOW_SQL', 'FALSE').toUpperCase() === 'TRUE',
  DEFAULT_USERNAME: getOrDefault('DEFAULT_USERNAME', ''),
  DEFAULT_PASSWORD: getOrDefault('DEFAULT_PASSWORD', ''),
  DEFAULT_USER_EMAIL: getOrDefault('DEFAULT_USER_EMAIL', ''),
  LINK_URL_PREFIX: getOrThrow('LINK_URL_PREFIX'),
  SMTP_HOST: getOrThrow('SMTP_HOST'),
  SMTP_USERNAME: getOrThrow('SMTP_USERNAME'),
  SMTP_PASSWORD: getOrThrow('SMTP_PASSWORD'),
  SMTP_PORT: parseInt(getOrThrow('SMTP_PORT'), 10),
  SMTP_MAILER_SOURCE: getOrThrow('SMTP_MAILER_SOURCE'),
};

export default env;

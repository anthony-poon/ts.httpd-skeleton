import env from '../../env';
import WinstonLoggerFactory from './impl/winston';

export type LoggerFactory = {
  create: (namespace: string) => Logger;
};

export interface Logger {
  emergency: (message: string) => void;
  alert: (message: string) => void;
  critical: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  debug: (message: string) => void;
}

const loggerFactory: LoggerFactory = new WinstonLoggerFactory(env);
export default loggerFactory;

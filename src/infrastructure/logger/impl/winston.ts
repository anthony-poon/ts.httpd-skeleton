import { createLogger, format, transports } from 'winston';

import { AppEnv } from '../../../env';
import type { LoggerFactory } from '../index';

class LoggerFactoryImpl implements LoggerFactory {
  constructor(private readonly env: AppEnv) {}

  create(namespace: string) {
    const logger = this.createWinstonLogger(namespace);
    return {
      emergency: (message: string) => logger.emerg(message),
      alert: (message: string) => logger.alert(message),
      critical: (message: string) => logger.crit(message),
      error: (message: string) => logger.error(message),
      warning: (message: string) => logger.warning(message),
      info: (message: string) => logger.info(message),
      debug: (message: string) => logger.debug(message),
    };
  }

  private createWinstonLogger(namespace: string) {
    return createLogger({
      level: this.env.LOG_LEVEL.toLowerCase(),
      format: format.combine(
        format.errors({ stack: true }),
        format.label({ label: namespace }),
        format((info) => ({
          ...info,
          level: info.level.toUpperCase(),
        }))(),
        format.timestamp(),
        format.colorize(),
        format.printf(({ level, message, timestamp, stack }) => {
          if (stack) {
            return `[${timestamp}] ${level}: ${message}\n${stack}`;
          }
          return `[${timestamp}] ${level}: ${message}`;
        }),
      ),
      transports: [new transports.Console()],
    });
  }
}

export default LoggerFactoryImpl;

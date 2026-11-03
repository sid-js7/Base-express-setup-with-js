import pino from 'pino';
import env from './env.config.js';

const isProduction = env.nodeEnv === 'production';

export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  base: {
    service: env.serviceName || 'salon-backend',
    version: env.serviceVersion || '1.0.0',
    environment: env.nodeEnv || 'development',
  },

  timestamp: pino.stdTimeFunctions.epochTime,
  redact: {
    paths: [
      'password',
      '*.password',
      'token',
      '*.token',
      'walletPin',
      '*.walletPin',
      'telegramBotToken',
      '*.telegramBotToken',
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers.x-bot-secret',
    ],
    censor: '[REDACTED]',
  },
  serializers: {
    err: pino.stdSerializers.err,
    http(request) {
      const headers = request.headers || {};

      return {
        method: request.method,
        url: request.originalUrl || request.url,
        ip:
          headers['cf-connecting-ip'] ||
          headers['x-forwarded-for']?.split(',')[0].trim() ||
          request.ip ||
          request.socket?.remoteAddress,
        headers: {
          host: headers['host'],
          userAgent: headers['user-agent'] || 'unknown',
          contentType: headers['content-type'],
          referer: headers['referer'] || headers['origin'],
        },
      };
    },
  },
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

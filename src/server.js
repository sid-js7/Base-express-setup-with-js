import app from './app.js';
import env from './config/env.config.js';
import { logger } from './config/logger.config.js';

const PORT = Number(env.port) || 3000;

let server;
let isShuttingDown = false;

const shutdown = (signal, exitCode = 0) => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  if (!server) {
    process.exit(exitCode);
  }

  // Force shutdown if graceful shutdown takes too long.
  const forceShutdownTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);

  forceShutdownTimer.unref();

  server.close((error) => {
    clearTimeout(forceShutdownTimer);

    if (error) {
      logger.error('Error during server shutdown:', error);
      process.exit(1);
    }

    logger.info('HTTP server closed successfully.');
    process.exit(exitCode);
  });

  // Close idle connections immediately.
  server.closeIdleConnections?.();
};

// Start server
try {
  server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Environment: ${env.nodeEnv || 'development'}`);
  });

  // Handle server errors, including port conflicts.
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use.`);
    } else {
      logger.error('HTTP server error:', error);
    }

    shutdown('SERVER_ERROR', 1);
  });

  // Graceful shutdown signals.
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Unexpected synchronous errors.
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    shutdown('UNCAUGHT_EXCEPTION', 1);
  });

  // Unexpected rejected promises.
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection:', reason);
    shutdown('UNHANDLED_REJECTION', 1);
  });
} catch (error) {
  logger.error('Failed to start server:', error);
  process.exit(1);
}

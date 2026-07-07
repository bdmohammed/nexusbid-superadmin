// import { logger } from '../logger';
// import { AppError } from './AppError';
// import { ErrorCode } from './ErrorCode';
// import { parseError } from './parser';

// export interface ErrorProvider {
//   name: string;
//   capture(error: AppError): void;
// }

// class ConsoleProvider implements ErrorProvider {
//   public name = 'Console';
//   public capture(error: AppError) {
//     if (process.env.NODE_ENV !== 'production') {
//       console.error('[ConsoleProvider] Captured error:', {
//         message: error.message,
//         status: error.status,
//         code: error.code,
//         traceId: error.traceId,
//         details: error.details,
//         stack: error.stack,
//       });
//     }
//   }
// }

// class LoggerProvider implements ErrorProvider {
//   public name = 'InternalLogger';
//   public capture(error: AppError) {
//     logger.error(`[${error.code}] ${error.message}`, {
//       status: error.status,
//       traceId: error.traceId,
//       details: error.details,
//     });
//   }
// }

// class ErrorReporter {
//   private providers: ErrorProvider[] = [];

//   constructor() {
//     // Register default providers
//     this.registerProvider(new ConsoleProvider());
//     this.registerProvider(new LoggerProvider());
//   }

//   public registerProvider(provider: ErrorProvider) {
//     this.providers.push(provider);
//   }

//   public capture(error: unknown) {
//     const appError = parseError(error);

//     // Skip reporting for expected/client-side errors like unauthorized or validation
//     if (
//       appError.code === ErrorCode.UNAUTHORIZED ||
//       appError.code === ErrorCode.VALIDATION
//     ) {
//       return;
//     }

//     for (const provider of this.providers) {
//       try {
//         provider.capture(appError);
//       } catch (providerError) {
//         console.error(`ErrorReporter provider "${provider.name}" failed:`, providerError);
//       }
//     }
//   }
// }

// export const errorReporter = new ErrorReporter();
// export default errorReporter;

/**
 * 환경별 로깅 래퍼
 *
 * CLAUDE.md 2절: console.log는 개발 중에도 사용하지 않는다.
 * 디버깅은 이 래퍼를 통해 환경별로 제어한다.
 *
 * - development: 모든 레벨 출력
 * - production / staging: warn, error만 출력
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

function getEnvironment(): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NEXT_PUBLIC_ENV ?? process.env.NODE_ENV ?? 'development';
  }
  return 'production';
}

function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

function formatLogEntry(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  return `${prefix} ${entry.message}`;
}

function createLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  };
}

function writeLog(entry: LogEntry): void {
  const formatted = formatLogEntry(entry);

  switch (entry.level) {
    case 'debug':
      if (isDevelopment()) {
        // eslint-disable-next-line no-console
        console.debug(formatted, entry.data !== undefined ? entry.data : '');
      }
      break;
    case 'info':
      if (isDevelopment()) {
        // eslint-disable-next-line no-console
        console.info(formatted, entry.data !== undefined ? entry.data : '');
      }
      break;
    case 'warn':
      // eslint-disable-next-line no-console
      console.warn(formatted, entry.data !== undefined ? entry.data : '');
      break;
    case 'error':
      // eslint-disable-next-line no-console
      console.error(formatted, entry.data !== undefined ? entry.data : '');
      break;
  }
}

/**
 * 환경별 로깅 유틸리티
 *
 * @example
 * ```ts
 * import { logger } from '@/lib/utils/logger';
 *
 * logger.info('Profile loaded', { profileId: 'abc' });
 * logger.error('Failed to evaluate eligibility', error);
 * ```
 */
export const logger = {
  /** 디버그 로그 (development에서만 출력) */
  debug(message: string, data?: unknown): void {
    writeLog(createLogEntry('debug', message, data));
  },

  /** 정보 로그 (development에서만 출력) */
  info(message: string, data?: unknown): void {
    writeLog(createLogEntry('info', message, data));
  },

  /** 경고 로그 (모든 환경에서 출력) */
  warn(message: string, data?: unknown): void {
    writeLog(createLogEntry('warn', message, data));
  },

  /** 에러 로그 (모든 환경에서 출력) */
  error(message: string, data?: unknown): void {
    writeLog(createLogEntry('error', message, data));
  },
} as const;

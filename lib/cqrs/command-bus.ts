/**
 * CQRS 패턴 - Command 버스
 * Command와 Query를 분리하여 확장성과 성능 개선
 */

import { eventBus, EVENTS } from '../events/event-bus';

export interface Command {
  type: string;
  payload: any;
  metadata?: {
    userId?: string;
    timestamp?: number;
    correlationId?: string;
  };
}

export interface CommandResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    executionTime: number;
    timestamp: number;
  };
}

export interface CommandHandler<TCommand extends Command = Command, TResult = any> {
  handle(command: TCommand): Promise<CommandResult<TResult>>;
}

/**
 * Command 버스 - 명령 처리 중앙화
 */
export class CommandBus {
  private static instance: CommandBus;
  private handlers = new Map<string, CommandHandler>();
  private middleware: CommandMiddleware[] = [];

  private constructor() {}

  static getInstance(): CommandBus {
    if (!CommandBus.instance) {
      CommandBus.instance = new CommandBus();
    }
    return CommandBus.instance;
  }

  /**
   * Command 핸들러 등록
   */
  registerHandler<T extends Command>(
    commandType: string, 
    handler: CommandHandler<T>
  ): void {
    this.handlers.set(commandType, handler);
  }

  /**
   * 미들웨어 추가
   */
  use(middleware: CommandMiddleware): void {
    this.middleware.push(middleware);
  }

  /**
   * Command 실행
   */
  async execute<T extends Command, R = any>(command: T): Promise<CommandResult<R>> {
    const startTime = Date.now();

    try {
      // 미들웨어 실행 (전처리)
      let processedCommand = command;
      for (const middleware of this.middleware) {
        if (middleware.before) {
          processedCommand = await middleware.before(processedCommand) || processedCommand;
        }
      }

      // 핸들러 찾기
      const handler = this.handlers.get(command.type);
      if (!handler) {
        throw new Error(`No handler registered for command type: ${command.type}`);
      }

      // Command 실행
      const result = await handler.handle(processedCommand);

      // 성공 이벤트 발행
      await eventBus.emit('command.executed', {
        command: command.type,
        success: true,
        executionTime: Date.now() - startTime
      });

      // 미들웨어 실행 (후처리)
      for (const middleware of this.middleware) {
        if (middleware.after) {
          await middleware.after(processedCommand, result);
        }
      }

      return {
        ...result,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: Date.now()
        }
      };

    } catch (error) {
      const errorResult: CommandResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: Date.now()
        }
      };

      // 에러 이벤트 발행
      await eventBus.emit(EVENTS.SYSTEM_ERROR, {
        command: command.type,
        error: errorResult.error,
        executionTime: Date.now() - startTime
      });

      return errorResult;
    }
  }
}

// Command 미들웨어 인터페이스
export interface CommandMiddleware {
  before?(command: Command): Promise<Command | void>;
  after?(command: Command, result: CommandResult): Promise<void>;
}

// 로깅 미들웨어
export class LoggingMiddleware implements CommandMiddleware {
  async before(command: Command): Promise<void> {
    console.log(`[COMMAND] Executing: ${command.type}`, {
      payload: command.payload,
      metadata: command.metadata
    });
  }

  async after(command: Command, result: CommandResult): Promise<void> {
    const status = result.success ? 'SUCCESS' : 'FAILED';
    console.log(`[COMMAND] ${status}: ${command.type}`, {
      executionTime: result.metadata?.executionTime,
      error: result.error
    });
  }
}

// 검증 미들웨어
export class ValidationMiddleware implements CommandMiddleware {
  async before(command: Command): Promise<Command> {
    // 기본 검증 로직
    if (!command.type) {
      throw new Error('Command type is required');
    }

    if (!command.metadata) {
      command.metadata = {
        timestamp: Date.now()
      };
    }

    return command;
  }
}

// 전역 Command 버스 인스턴스
export const commandBus = CommandBus.getInstance();

// 기본 미들웨어 등록
commandBus.use(new ValidationMiddleware());
commandBus.use(new LoggingMiddleware());

// Command 타입 정의
export const COMMANDS = {
  // 아티스트 관련
  CREATE_ARTIST: 'create.artist',
  UPDATE_ARTIST: 'update.artist',
  DELETE_ARTIST: 'delete.artist',
  
  // 작품 관련
  CREATE_ARTWORK: 'create.artwork',
  UPDATE_ARTWORK: 'update.artwork',
  DELETE_ARTWORK: 'delete.artwork',
  
  // 관리자 관련
  SYNC_DATA: 'admin.sync_data',
  GENERATE_REPORT: 'admin.generate_report'
} as const;

export type CommandType = typeof COMMANDS[keyof typeof COMMANDS];
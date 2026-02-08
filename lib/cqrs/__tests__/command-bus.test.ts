import { CommandBus, COMMANDS, Command } from '../command-bus';
import { eventBus } from '../../events/event-bus';
import { AppError } from '../../utils/app-error';

describe('CommandBus Integration', () => {
  let commandBus: CommandBus;

  beforeEach(() => {
    // Reset singleton instance for testing if possible, or just get instance
    // Since it's a singleton, we need to be careful.
    // Ideally we would have a way to reset it, currently we just use the instance.
    commandBus = CommandBus.getInstance();
    // We might need to clear handlers/middleware if they persist, 
    // but CommandBus doesn't expose clear methods.
    // For this test, we accept existing state or assume fresh environment per test file run by Jest.
  });

  it('should execute a command and emit event', async () => {
    // Setup
    const commandType = 'test.command';
    const payload = { foo: 'bar' };
    
    // Register handler
    commandBus.registerHandler(commandType, {
      handle: async (cmd) => {
        return { success: true, data: 'processed' };
      }
    });

    // Spy on event bus
    const emitSpy = jest.spyOn(eventBus, 'emit');

    // Execute
    const result = await commandBus.execute({
      type: commandType,
      payload
    });

    // Verify
    expect(result.success).toBe(true);
    expect(result.data).toBe('processed');
    expect(result.metadata).toBeDefined();
    
    expect(emitSpy).toHaveBeenCalledWith('command.executed', expect.objectContaining({
      command: commandType,
      success: true
    }));
  });

  it('should handle AppError correctly', async () => {
    // Setup
    const commandType = 'test.error.command';
    const errorMessage = 'Custom App Error';
    
    // Register handler that throws AppError
    commandBus.registerHandler(commandType, {
      handle: async (cmd) => {
        throw AppError.badRequest(errorMessage);
      }
    });

    // Execute
    const result = await commandBus.execute({
      type: commandType,
      payload: {}
    });

    // Verify
    expect(result.success).toBe(false);
    expect(result.error).toBe(errorMessage);
    expect(result.statusCode).toBe(400);
  });
});

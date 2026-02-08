import { ArtistAgent, agentPool } from '../artist-agent';
import { commandBus, COMMANDS } from '../../cqrs/command-bus';
import { queryBus, QUERIES } from '../../cqrs/query-bus';
import { agentMonitor } from '../../monitoring/agent-monitor';

// Mock dependencies
jest.mock('../../cqrs/command-bus');
jest.mock('../../cqrs/query-bus');
jest.mock('../../monitoring/agent-monitor');
jest.mock('../../events/event-bus');

describe('ArtistAgent', () => {
  let agent: ArtistAgent;

  beforeEach(() => {
    agent = new ArtistAgent();
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create an artist successfully', async () => {
      // Setup
      const artistData = { name: 'Test Artist', bio: 'Test Bio' };
      const taskInput = { action: 'create', data: artistData } as any;
      const task = { input: taskInput } as any;

      (commandBus.execute as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: '123', ...artistData }
      });

      // Execute
      const result = await agent.execute(task);

      // Verify
      expect(result.success).toBe(true);
      expect(commandBus.execute).toHaveBeenCalledWith(expect.objectContaining({
        type: COMMANDS.CREATE_ARTIST,
        payload: artistData
      }));
      expect(agentMonitor.trackExecution).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        taskType: 'create'
      }));
    });

    it('should handle validation errors', async () => {
      // Setup
      const artistData = { name: '', bio: '' }; // Invalid data
      const taskInput = { action: 'create', data: artistData } as any;
      const task = { input: taskInput } as any;

      // Execute
      const result = await agent.execute(task);

      // Verify
      expect(result.success).toBe(false);
      expect(result.validationErrors).toBeDefined();
      expect(commandBus.execute).not.toHaveBeenCalled();
      // Monitor should track failure (or success of the 'validate' step logic, but here create calls validate)
      // Logic in agent: if validate fails, it returns validation result.
      // And the execute wrapper tracks status based on result.success
      expect(agentMonitor.trackExecution).toHaveBeenCalledWith(expect.objectContaining({
        status: 'failure',
        taskType: 'create'
      }));
    });
  });
});

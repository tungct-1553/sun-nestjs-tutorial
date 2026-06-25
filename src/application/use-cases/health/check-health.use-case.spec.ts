import { CheckHealthUseCase } from '@application/use-cases/health/check-health.use-case';

describe('CheckHealthUseCase', () => {
  it('returns ok status with ISO timestamp', () => {
    const useCase = new CheckHealthUseCase();
    const result = useCase.execute();

    expect(result.status).toBe('ok');
    expect(() => new Date(result.timestamp)).not.toThrow();
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });
});

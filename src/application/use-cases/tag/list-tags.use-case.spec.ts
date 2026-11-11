import { ListTagsUseCase } from './list-tags.use-case';

describe('ListTagsUseCase', () => {
  it('returns the tag names supplied by the repository', async () => {
    const findAll = jest.fn().mockResolvedValue(['nestjs', 'typescript']);
    const useCase = new ListTagsUseCase({ findAll });

    await expect(useCase.execute()).resolves.toEqual(['nestjs', 'typescript']);
    expect(findAll).toHaveBeenCalledTimes(1);
  });

  it('returns an empty list when there are no tags', async () => {
    const useCase = new ListTagsUseCase({ findAll: () => Promise.resolve([]) });

    await expect(useCase.execute()).resolves.toEqual([]);
  });
});

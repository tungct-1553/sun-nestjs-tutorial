export const slugifyTitle = (title: string): string =>
  title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const resolveUniqueSlug = async (
  title: string,
  slugExists: (slug: string) => Promise<boolean>,
): Promise<string> => {
  const baseSlug = slugifyTitle(title);

  if (!baseSlug) {
    return resolveUniqueSlug('article', slugExists);
  }

  const exists = async (slug: string): Promise<boolean> => {
    const taken = await slugExists(slug);
    return taken;
  };

  if (!(await exists(baseSlug))) {
    return baseSlug;
  }

  let counter = 2;
  while (await exists(`${baseSlug}-${counter}`)) {
    counter += 1;
  }

  return `${baseSlug}-${counter}`;
};
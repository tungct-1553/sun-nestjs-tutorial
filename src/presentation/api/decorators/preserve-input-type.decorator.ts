import { Transform } from 'class-transformer';

/** Preserve the submitted JSON type for string validation despite global implicit conversion. */
export const PreserveInputType = (): PropertyDecorator =>
  Transform(({ obj, key }) => (obj as Record<string, unknown>)[key], {
    toClassOnly: true,
  });

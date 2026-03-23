export function stringifyJsonValue(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return typeof value === 'string' ? value : JSON.stringify(value);
}

export function parseJsonValue<T>(value: unknown): T {
  if (typeof value !== 'string') {
    return value as T;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
}

export function serializeJsonFields<T extends Record<string, any>>(input: T, fields: readonly string[]): T {
  const output = { ...input } as T;

  for (const field of fields) {
    if (field in output) {
      (output as any)[field] = stringifyJsonValue((output as any)[field]);
    }
  }

  return output;
}

export function parseJsonFields<T extends Record<string, any>>(input: T, fields: readonly string[]): T {
  const output = { ...input } as T;

  for (const field of fields) {
    if (field in output && (output as any)[field] != null) {
      (output as any)[field] = parseJsonValue((output as any)[field]);
    }
  }

  return output;
}

export function parseJsonFieldArray<T extends Record<string, any>>(items: T[], fields: readonly string[]): T[] {
  return items.map((item) => parseJsonFields(item, fields));
}
export function toCamelCase<T>(obj: T): T {
  if (!obj || typeof obj !== "object") {
    if (obj instanceof Date) {
      return new Date(obj).toISOString() as any as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as any as T;
  }

  return Object.keys(obj).reduce((result: any, key) => {
    const camelKey = key.replace(/(_\w)/g, (match) => match[1].toUpperCase());
    const value = obj[key as keyof T];
    result[camelKey] =
      value instanceof Date
        ? new Date(value).toISOString()
        : toCamelCase(value);
    return result;
  }, {} as T);
}

export function toSnakeCase<T>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    if (obj instanceof Date) {
      return new Date(obj).toISOString() as any as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item)) as any as T;
  }

  return Object.keys(obj).reduce((result: any, key) => {
    const snakeKey = key
      .replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`)
      .replace(/^_/, "");
    const value = obj[key as keyof T];
    result[snakeKey as keyof T] =
      value instanceof Date
        ? new Date(value).toISOString()
        : toSnakeCase(value);
    return result;
  }, {} as T);
}
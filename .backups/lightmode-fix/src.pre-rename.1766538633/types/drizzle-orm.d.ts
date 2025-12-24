declare module 'drizzle-orm' {
  // Add specific types as needed
  export type QueryResult<T> = T & { rows: T[] };
  export function eq<T>(column: T, value: T): boolean;
  export function and(...conditions: boolean[]): boolean;
  export function or(...conditions: boolean[]): boolean;
  export function desc<T>(column: T): T;
  export function asc<T>(column: T): T;
  export function inArray<T>(column: T, values: T[]): boolean;
  export function sql(strings: TemplateStringsArray, ...values: any[]): string;

  export namespace sql {
    export function join(values: any[], separator: string): string;
  }
}
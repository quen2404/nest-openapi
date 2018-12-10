export class Response<T> {
  status: number;
  headers: Map<string, string[]> | null;
  body: T;
}

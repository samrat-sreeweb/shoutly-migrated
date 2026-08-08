export class OutstandApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'OutstandApiError';
    this.status = status;
    this.body = body;
  }
}

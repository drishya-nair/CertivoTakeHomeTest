export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message?: string) {
    super(message || HttpError.defaultMessage(statusCode));
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  static defaultMessage(code: number): string {
    if (code === 400) return "Bad Request";
    if (code === 401) return "Unauthorized";
    if (code === 403) return "Forbidden";
    if (code === 404) return "Not Found";
    if (code === 409) return "Conflict";
    if (code === 422) return "Unprocessable Entity";
    if (code === 429) return "Too Many Requests";
    if (code >= 500 && code < 600) return "Internal Server Error";
    return "Error";
  }
}

export default HttpError;



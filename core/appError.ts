type ErrorCodes = {
  NOT_FOUND: 404;
  UNAUTHORIZED: 401;
  FORBIDDEN: 403;
  BAD_REQUEST: 400;
  CONFLICT: 409;
  UNPROCESSABLE_ENTITY: 422;
  INTERNAL_SERVER_ERROR: 500;
  SERVICE_UNAVAILABLE: 503;
  GATEWAY_TIMEOUT: 504;

  METHOD_NOT_ALLOWED: 405;
};
export class AppError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
  getCustomeResponse() {
    switch (this.code) {
      case 404: {
        // NOTFOUND
      }
    }
  }
}

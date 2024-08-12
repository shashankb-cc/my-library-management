export const constants = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

class AppError {
  status: number;
  title: string;
  message: string;
  stackTrace: string | undefined;

  constructor(statusCode: number, err: Error) {
    this.status = statusCode;
    this.title = "";
    this.message = err.message;
    this.stackTrace = err.stack;

    switch (statusCode) {
      case constants.VALIDATION_ERROR:
        this.title = "Validation Failed";
        break;
      case constants.UNAUTHORIZED:
        this.title = "Unauthorized";
        break;
      case constants.FORBIDDEN:
        this.title = "Forbidden";
        break;
      case constants.NOT_FOUND:
        this.title = "Not Found";
        break;
      case constants.SERVER_ERROR:
        this.title = "Server Error";
        break;
      default:
        this.title = "Unknown Error";
        this.message = "An unexpected error occurred.";
        this.stackTrace = undefined;
    }
  }
}

export default AppError;
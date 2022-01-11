import {
  StatusCodes,
} from "http-status-codes";

export class ServiceError<T> extends Error {
  constructor(
    message: string,
    public readonly data = null as unknown as T,
    public readonly statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  ) {
    super(message);
  }
}

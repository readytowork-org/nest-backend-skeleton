export interface ResponseWithMessage {
  message: string;
}

export interface ResponseWithData<T> extends ResponseWithMessage {
  data: T;
}

export interface ResponseWithCount<T> extends ResponseWithMessage {
  data: T;
  count: number;
}

export function SuccessResponseMessage(message: string): ResponseWithMessage {
  return { message };
}

export function SuccessResponseWithData<T>(
  message: string,
  data: T,
): ResponseWithData<T> {
  return { message, data };
}

export function SuccessResponseWithCount<T>(
  message: string,
  data: T,
  count: number,
): ResponseWithCount<T> {
  return { message, data, count };
}

export interface Response {
  message: string;
}

export interface ResponseWithData<T> extends Response {
  data: T;
}

export interface ResponseWithCount<T> extends Response {
  data: T;
  count: number;
}

export function SuccessResponseMessage(message: string): Response {
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

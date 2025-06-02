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

export function SuccessResponseMessage(response: {
  message: string;
}): ResponseWithMessage {
  return response;
}

export function SuccessResponseWithData<T>(response: {
  message: string;
  data: T;
}): ResponseWithData<T> {
  return response;
}

export function SuccessResponseWithCount<T>(response: {
  message: string;
  data: T;
  count: number;
}): ResponseWithCount<T> {
  return response;
}

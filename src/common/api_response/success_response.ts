export interface iResponseWithMessage {
  status: boolean;
  message: string;
}

export interface iResponseWithData<T> extends iResponseWithMessage {
  data: T;
}

export interface iResponseWithCount<T> extends iResponseWithMessage {
  data: T;
  count: number;
}

export function SuccessResponseMessage(response: {
  status: boolean;
  message: string;
}): iResponseWithMessage {
  return response;
}

export function SuccessResponseWithData<T>(response: {
  status: boolean;
  message: string;
  data: T;
}): iResponseWithData<T> {
  return response;
}

export function SuccessResponseWithCount<T>(response: {
  status: boolean;
  message: string;
  data: T;
  count: number;
}): iResponseWithCount<T> {
  return response;
}

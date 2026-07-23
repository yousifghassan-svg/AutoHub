export type ApiMeta = {
  requestId: string;
  timestamp: string;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta: ApiMeta;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    statusCode: number;
    message: string | string[];
    code?: string;
    details?: unknown;
  };
  meta: ApiMeta;
};

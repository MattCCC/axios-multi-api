/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  FetchResponse,
  RequestHandlerConfig,
  ResponseError,
} from './request-handler';

export type RequestInterceptor<RequestBody = any, ResponseData = any> = (
  config: RequestHandlerConfig<ResponseData, RequestBody>,
) =>
  | RequestHandlerConfig<ResponseData, RequestBody>
  | void
  | Promise<RequestHandlerConfig<ResponseData, RequestBody>>
  | Promise<void>;

export type ResponseInterceptor<ResponseData = any> = (
  response: FetchResponse<ResponseData>,
) =>
  | FetchResponse<ResponseData>
  | void
  | Promise<FetchResponse<ResponseData>>
  | Promise<void>;

export type ErrorInterceptor<ResponseData = any, RequestBody = any> = (
  error: ResponseError<ResponseData, RequestBody>,
) => unknown;

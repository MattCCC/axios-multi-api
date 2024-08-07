import type { RequestHandler } from '../request-handler';
import type {
  RequestConfig,
  FetcherInstance,
  RequestHandlerConfig,
  FetchResponse,
} from './request-handler';

// Common type definitions
export declare type QueryParams<T = unknown> = Record<string, T> | null;
export declare type BodyPayload<T = unknown> = Record<string, T> | null;
export declare type QueryParamsOrBody<T = unknown> =
  | QueryParams<T>
  | BodyPayload<T>;
export declare type UrlPathParams<T = unknown> = Record<string, T> | null;
export declare type APIResponse = unknown;

// Endpoint function type
export declare type Endpoint<
  ResponseData = APIResponse,
  QueryParams = QueryParamsOrBody,
  PathParams = UrlPathParams,
> =
  | {
      (
        queryParams?: QueryParams,
        urlPathParams?: PathParams,
        requestConfig?: RequestConfig,
      ): Promise<ResponseData & FetchResponse<ResponseData>>;
    }
  | {
      <ReturnedData = ResponseData, T = QueryParams, T2 = PathParams>(
        queryParams?: T,
        urlPathParams?: T2,
        requestConfig?: RequestConfig,
      ): Promise<ReturnedData & FetchResponse<ReturnedData>>;
    };

type EndpointDefaults = Endpoint<never>;

type Fn = (...args: unknown[]) => unknown;

type EndpointsRecord<EndpointsMethods> = {
  [K in keyof EndpointsMethods]: EndpointsMethods[K] extends Fn
    ? EndpointsMethods[K]
    : EndpointDefaults;
};

type DefaultEndpoints<EndpointsCfg> = {
  [K in keyof EndpointsCfg]: EndpointDefaults;
};

export type EndpointsConfig<EndpointsMethods> = Record<
  keyof EndpointsMethods | string,
  RequestConfig
>;

type EndpointsConfigPart<EndpointsCfg, EndpointsMethods extends object> = [
  EndpointsCfg,
] extends [never]
  ? unknown
  : DefaultEndpoints<Omit<EndpointsCfg, keyof EndpointsMethods>>;

export type ApiHandlerReturnType<
  EndpointsMethods extends object,
  EndpointsCfg,
> = EndpointsRecord<EndpointsMethods> &
  EndpointsConfigPart<EndpointsCfg, EndpointsMethods> &
  ApiHandlerMethods<EndpointsMethods>;

export type ApiHandlerMethods<EndpointsMethods> = {
  config: ApiHandlerConfig<EndpointsMethods>;
  endpoints: EndpointsConfig<EndpointsMethods>;
  requestHandler: RequestHandler;
  getInstance: () => FetcherInstance;
  request: <ResponseData = APIResponse>(
    endpointName: keyof EndpointsMethods | string,
    queryParams?: QueryParams,
    urlPathParams?: UrlPathParams,
    requestConfig?: RequestConfig,
  ) => Promise<ResponseData & FetchResponse<ResponseData>>;
};

export interface ApiHandlerConfig<EndpointsMethods>
  extends RequestHandlerConfig {
  apiUrl: string;
  endpoints: EndpointsConfig<EndpointsMethods>;
}

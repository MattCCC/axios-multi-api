import type {
  AxiosStatic,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

export type IRequestResponse<T = any> = Promise<AxiosResponse<T>>;

export type ErrorHandlingStrategy =
  | 'throwError'
  | 'reject'
  | 'silent'
  | 'defaultResponse';

export type RequestError = AxiosError<any>;

interface ErrorHandlerClass {
  process(error?: RequestError): unknown;
}

type ErrorHandlerFunction = (error: RequestError) => any;

export interface EndpointConfig extends AxiosRequestConfig {
  cancellable?: boolean;
  rejectCancelled?: boolean;
  strategy?: ErrorHandlingStrategy;
  onError?: ErrorHandlerFunction | ErrorHandlerClass;
}

export interface RequestHandlerConfig extends EndpointConfig {
  axios: AxiosStatic;
  flattenResponse?: boolean;
  defaultResponse?: any;
  logger?: any;
  onError?: ErrorHandlerFunction | ErrorHandlerClass;
}

export interface APIHandlerConfig extends RequestHandlerConfig {
  apiUrl: string;
  endpoints: Record<string, any>;
}

export interface IRequestData {
  type: string;
  url: string;
  data?: any;
  config: EndpointConfig;
}

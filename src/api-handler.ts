import type {
  FetcherInstance,
  RequestConfig,
  FetchResponse,
} from './types/request-handler';
import type {
  ApiHandlerConfig,
  ApiHandlerMethods,
  ApiHandlerReturnType,
  APIResponse,
  QueryParamsOrBody,
  UrlPathParams,
} from './types/api-handler';
import { createRequestHandler } from './request-handler';

/**
 * Creates an instance of API Handler.
 * It creates an API fetcher function using native fetch() or a custom fetcher if it is passed as "fetcher".
 * @url https://github.com/MattCCC/fetchff
 *
 * @param {Object} config - Configuration object for the API fetcher.
 * @param {string} config.apiUrl - The base URL for the API.
 * @param {Object} config.endpoints - An object containing endpoint definitions.
 * @param {number} config.timeout - You can set the timeout for particular request in milliseconds.
 * @param {number} config.cancellable - If true, the ongoing previous requests will be automatically cancelled.
 * @param {number} config.rejectCancelled - If true and request is set to cancellable, a cancelled request promise will be rejected. By default, instead of rejecting the promise, defaultResponse is returned.
 * @param {number} config.timeout - Request timeout
 * @param {number} config.dedupeTime - Time window, in milliseconds, during which identical requests are deduplicated (treated as single request).
 * @param {string} config.strategy - Error Handling Strategy
 * @param {string} config.flattenResponse - Whether to flatten response "data" object within "data" one
 * @param {*} config.defaultResponse - Default response when there is no data or when endpoint fails depending on the chosen strategy. It's "null" by default
 * @param {Object} [config.retry] - Options for retrying requests.
 * @param {number} [config.retry.retries=0] - Number of retry attempts. No retries by default.
 * @param {number} [config.retry.delay=1000] - Initial delay between retries in milliseconds.
 * @param {number} [config.retry.backoff=1.5] - Exponential backoff factor.
 * @param {number[]} [config.retry.retryOn=[502, 504, 408]] - HTTP status codes to retry on.
 * @param {RequestInterceptor|RequestInterceptor[]} [config.onRequest] - Optional request interceptor function or an array of functions.
 * These functions will be called with the request configuration object before the request is made. Can be used to modify or log the request configuration.
 * @param {ResponseInterceptor|ResponseInterceptor[]} [config.onResponse] - Optional response interceptor function or an array of functions.
 * These functions will be called with the response object after the response is received. an be used to modify or log the response data.
 * @param {Function} [config.onError] - Optional callback function for handling errors.
 * @param {Object} [config.headers] - Optional default headers to include in every request.
 * @param {Object} config.fetcher - The Custom Fetcher instance to use for making requests. It should expose create() and request() functions.
 * @param {*} config.logger - Instance of custom logger. Either class or an object similar to "console". Console is used by default.
 * @returns API handler functions and endpoints to call
 *
 * @example
 * // Define endpoint paths
 * const endpoints = {
 *   getUser: '/user',
 *   createPost: '/post',
 * };
 *
 * // Create the API fetcher with configuration
 * const api = createApiFetcher({
 *   endpoints,
 *   apiUrl: 'https://example.com/api',
 *   onError(error) {
 *     console.log('Request failed', error);
 *   },
 *   headers: {
 *     'my-auth-key': 'example-auth-key-32rjjfa',
 *   },
 * });
 *
 * // Fetch user data
 * const response = await api.getUser({ userId: 1, ratings: [1, 2] })
 */
function createApiFetcher<
  EndpointsMethods extends object,
  EndpointsCfg = never,
>(config: ApiHandlerConfig<EndpointsMethods>) {
  const endpoints = config.endpoints;
  const requestHandler = createRequestHandler(config);

  /**
   * Get Fetcher Provider Instance
   *
   * @returns {FetcherInstance} Request Handler's Fetcher instance
   */
  function getInstance(): FetcherInstance {
    return requestHandler.getInstance();
  }

  /**
   * Triggered when trying to use non-existent endpoints
   *
   * @param endpointName Endpoint Name
   * @returns {Promise}
   */
  function handleNonImplemented(endpointName: string): Promise<null> {
    console.error(`Add ${endpointName} to 'endpoints'.`);

    return Promise.resolve(null);
  }

  /**
   * Handle Single API Request
   * It considers settings in following order: per-request settings, global per-endpoint settings, global settings.
   *
   * @param {string} endpointName - The name of the API endpoint to call.
   * @param {QueryParamsOrBody} [data={}] - Query parameters to include in the request.
   * @param {UrlPathParams} [urlPathParams={}] - URI parameters to include in the request.
   * @param {EndpointConfig} [requestConfig={}] - Additional configuration for the request.
   * @returns {Promise<Response & FetchResponse>} - A promise that resolves with the response from the API provider.
   */
  async function request<Response = APIResponse>(
    endpointName: keyof EndpointsMethods | string,
    data: QueryParamsOrBody = {},
    urlPathParams: UrlPathParams = {},
    requestConfig: RequestConfig = {},
  ): Promise<Response & FetchResponse<Response>> {
    // Use global per-endpoint settings
    const endpointConfig = endpoints[endpointName as string];

    const responseData = await requestHandler.request<Response>(
      endpointConfig.url,
      data,
      {
        ...(endpointConfig || {}),
        ...requestConfig,
        urlPathParams,
      },
    );

    return responseData;
  }

  /**
   * Maps all API requests using native Proxy
   *
   * @param {*} prop          Caller
   */
  function get(prop: string) {
    if (prop in apiHandler) {
      return apiHandler[
        prop as unknown as keyof ApiHandlerMethods<EndpointsMethods>
      ];
    }

    // Prevent handler from triggering non-existent endpoints
    if (!endpoints[prop]) {
      return handleNonImplemented.bind(null, prop);
    }

    return apiHandler.request.bind(null, prop);
  }

  const apiHandler: ApiHandlerMethods<EndpointsMethods> = {
    config,
    endpoints,
    requestHandler,
    getInstance,
    request,
  };

  return new Proxy(apiHandler, {
    get: (_target, prop: string) => get(prop),
  }) as ApiHandlerReturnType<EndpointsMethods, EndpointsCfg>;
}

export { createApiFetcher };

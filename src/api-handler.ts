import { RequestHandler } from './request-handler';
import type {
  RequestResponse,
  FetcherInstance,
  RequestConfig,
} from './types/request-handler';
import type {
  ApiHandlerConfig,
  ApiHandlerMethods,
  ApiHandlerReturnType,
  APIQueryParams,
  APIUriParams,
} from './types/api';

/**
 * Creates an instance of API Handler.
 * It creates an API fetcher function using native fetch() or Axios if it is passed as "fetcher".
 *
 * @param {Object} config - Configuration object for the API fetcher.
 * @param {Object} config.fetcher - The Axios (or any other) instance to use for making requests.
 * @param {Object} config.endpoints - An object containing endpoint definitions.
 * @param {string} config.apiUrl - The base URL for the API.
 * @param {Function} [config.onError] - Optional callback function for handling errors.
 * @param {Object} [config.headers] - Optional default headers to include in every request.
 * @returns API handler functions and endpoints to call
 *
 * @example
 * // Import axios
 * import axios from 'axios';
 *
 * // Define endpoint paths
 * const endpoints = {
 *   getUser: '/user',
 *   createPost: '/post',
 * };
 *
 * // Create the API fetcher with configuration
 * const api = createApiFetcher({
 *   fetcher: axios, // Axios instance (optional)
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

function createApiFetcher<EndpointsMethods = never, EndpointsCfg = never>(
  config: ApiHandlerConfig<EndpointsMethods>,
) {
  const endpoints = config.endpoints;
  const requestHandler = new RequestHandler(config);

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
    console.error(`${endpointName} endpoint must be added to 'endpoints'.`);

    return Promise.resolve(null);
  }

  /**
   * Handle Single API Request
   * It considers settings in following order: per-request settings, global per-endpoint settings, global settings.
   *
   * @param {string} endpointName - The name of the API endpoint to call.
   * @param {APIQueryParams} [queryParams={}] - Query parameters to include in the request.
   * @param {APIUriParams} [uriParams={}] - URI parameters to include in the request.
   * @param {EndpointConfig} [requestConfig={}] - Additional configuration for the request.
   * @returns {Promise<RequestResponse>} - A promise that resolves with the response from the API provider.
   */
  async function handleRequest(
    endpointName: keyof EndpointsMethods & string,
    queryParams: APIQueryParams = {},
    uriParams: APIUriParams = {},
    requestConfig: RequestConfig = {},
  ): Promise<RequestResponse> {
    // Use global per-endpoint settings
    const endpoint = endpoints[endpointName as string];
    const endpointSettings = { ...endpoint };

    const responseData = await requestHandler.handleRequest(
      endpointSettings.url,
      queryParams,
      {
        ...endpointSettings,
        ...requestConfig,
        uriParams,
      },
    );

    return responseData;
  }

  /**
   * Maps all API requests using native Proxy
   *
   * @param {*} prop          Caller
   */
  function get(prop: string | symbol) {
    if (prop in apiHandler) {
      return apiHandler[prop];
    }

    // Prevent handler from triggering non-existent endpoints
    if (!endpoints[prop as string]) {
      return handleNonImplemented.bind(null, prop);
    }

    return apiHandler.handleRequest.bind(null, prop);
  }

  const apiHandler: ApiHandlerMethods<EndpointsMethods> = {
    config,
    endpoints,
    requestHandler,
    getInstance,
    handleRequest,
  };

  return new Proxy(apiHandler, {
    get: (_target, prop) => get(prop),
  }) as ApiHandlerReturnType<EndpointsMethods, EndpointsCfg>;
}

export { createApiFetcher };

// 3rd party libs
import axios, {
    AxiosInstance,
    Method,
} from 'axios';

// Shared Modules
import {
    HttpRequestErrorHandler,
} from './http-request-error-handler';

// Types
import {
    IHttpRequestHandler,
    IRequestData,
    IRequestResponse,
    InterceptorCallback,
    ErrorHandlingStrategy,
    RequestHandlerConfig,
    EndpointConfig,
} from './types/http-request-handler';

/**
 * Generic Request Handler
 * It creates an Axios instance and handles requests within that instance
 * It handles errors depending on a chosen error handling strategy
 */
export class HttpRequestHandler implements IHttpRequestHandler {
    /**
     * @var requestInstance Provider's instance
     */
    public requestInstance: AxiosInstance;

    /**
     * @var timeout Request timeout
     */
    public timeout: number = 30000;

    /**
     * @var cancellable Response cancellation
     */
    public cancellable: boolean = false;

    /**
     * @var strategy Request timeout
     */
    public strategy: ErrorHandlingStrategy = 'silent';

    /**
     * @var flattenResponse Response flattening
     */
    public flattenResponse: boolean = true;

    /**
     * @var defaultResponse Response flattening
     */
    public defaultResponse: any = null;

    /**
     * @var logger Logger
     */
    protected logger: any;

    /**
     * @var httpRequestErrorService HTTP error service
     */
    protected httpRequestErrorService: any;

    /**
     * @var requestsQueue    Queue of requests
     */
    protected requestsQueue: Map<string, any>;

    /**
     * Creates an instance of HttpRequestHandler
     *
     * @param {string} baseURL              Base URL for all API calls
     * @param {number} timeout              Request timeout
     * @param {string} strategy             Error Handling Strategy
     * @param {string} flattenResponse      Whether to flatten response "data" object within "data" one
     * @param {*} logger                    Instance of Logger Class
     * @param {*} httpRequestErrorService   Instance of Error Service Class
     */
    public constructor({
        baseURL = '',
        timeout = null,
        cancellable = false,
        strategy = null,
        flattenResponse = null,
        defaultResponse = {},
        logger = null,
        onError = null,
        ...config
    }: RequestHandlerConfig) {
        this.timeout = timeout !== null ? timeout : this.timeout;
        this.strategy = strategy !== null ? strategy : this.strategy;
        this.cancellable = cancellable || this.cancellable;
        this.flattenResponse = flattenResponse !== null ? flattenResponse : this.flattenResponse;
        this.defaultResponse = defaultResponse;
        this.logger = logger || global.console || window.console || null;
        this.httpRequestErrorService = onError;
        this.requestsQueue = new Map();

        this.requestInstance = axios.create({
            ...config,
            baseURL,
            timeout: this.timeout,
        });
    }

    /**
     * Get Provider Instance
     *
     * @returns {AxiosInstance} Provider's instance
     */
    public getInstance(): AxiosInstance {
        return this.requestInstance;
    }

    /**
     * Intercept Request
     *
     * @param {*} callback callback to use before request
     * @returns {void}
     */
    public interceptRequest(callback: InterceptorCallback): void {
        this.getInstance().interceptors.request.use(callback);
    }

    /**
     * POST Request
     *
     * @param {string} url                  Url
     * @param {*} data                      Payload
     * @param {EndpointConfig} config       Config
     * @throws {Error}                      If request fails
     * @returns {Promise}                   Request response or error info
     */
    public post(url: string, data: any = null, config: EndpointConfig = null): Promise<IRequestResponse> {
        return this.handleRequest({
            type: 'post',
            url,
            data,
            config,
        });
    }

    /**
     * GET Request
     *
     * @param {string} url                  Url
     * @param {*} data                      Payload
     * @param {EndpointConfig} config       Config
     * @throws {Error}                      If request fails
     * @returns {Promise}                   Request response or error info
     */
    public get(url: string, data: any = null, config: EndpointConfig = null): Promise<IRequestResponse> {
        return this.handleRequest({
            type: 'get',
            url,
            data,
            config,
        });
    }

    /**
     * PUT Request
     *
     * @param {string} url                  Url
     * @param {*} data                      Payload
     * @param {EndpointConfig} config       Config
     * @throws {Error}                      If request fails
     * @returns {Promise}                   Request response or error info
     */
    public put(url: string, data: any = null, config: EndpointConfig = null): Promise<IRequestResponse> {
        return this.handleRequest({
            type: 'put',
            url,
            data,
            config,
        });
    }

    /**
     * DELETE Request
     *
     * @param {string} url                  Url
     * @param {*} data                      Payload
     * @param {EndpointConfig} config       Config
     * @throws {Error}                      If request fails
     * @returns {Promise}                   Request response or error info
     */
    public delete(url: string, data: any = null, config: EndpointConfig = null): Promise<IRequestResponse> {
        return this.handleRequest({
            type: 'delete',
            url,
            data,
            config,
        });
    }

    /**
     * PATCH Request
     *
     * @param {string} url                  Url
     * @param {*} data                      Payload
     * @param {EndpointConfig} config       Config
     * @throws {Error}                      If request fails
     * @returns {Promise}                   Request response or error info
     */
    public patch(url: string, data: any = null, config: EndpointConfig = null): Promise<IRequestResponse> {
        return this.handleRequest({
            type: 'patch',
            url,
            data,
            config,
        });
    }

    /**
     * HEAD Request
     *
     * @param {string} url                  Url
     * @param {*} data                      Payload
     * @param {EndpointConfig} config       Config
     * @throws {Error}                      If request fails
     * @returns {Promise}                   Request response or error info
     */
    public head(url: string, data: any = null, config: EndpointConfig = null): Promise<IRequestResponse> {
        return this.handleRequest({
            type: 'head',
            url,
            data,
            config,
        });
    }

    /**
     * Build request configuration
     *
     * @param {string} type                 Request type
     * @param {string} url                  Request url
     * @param {*}      data                 Request data
     * @param {EndpointConfig} config       Request config
     * @returns {AxiosInstance} Provider's instance
     */
    protected buildRequestConfig(type: string, url: string, data: any, config: EndpointConfig): EndpointConfig {
        const key = type === 'get' || type === 'head' ? 'params' : 'data';

        return {
            ...config,
            url,
            method: type as Method,
            [key]: data || {},
        };
    }

    /**
     * Process global Request Error
     *
     * @param {Error} error      Error instance
     * @returns {AxiosInstance} Provider's instance
     */
    protected processRequestError(error: Error): void {
        if (axios.isCancel(error)) {
            return;
        }

        const errorHandler = new HttpRequestErrorHandler(
            this.logger,
            this.httpRequestErrorService
        );

        errorHandler.process(error);
    }

    /**
     * Output error response depending on chosen strategy
     *
     * @param {Error} error      Error instance
     * @param {EndpointConfig} requestConfig   Per endpoint request config
     * @returns {AxiosInstance} Provider's instance
     */
    protected async outputErrorResponse(error: Error, requestConfig: EndpointConfig): Promise<IRequestResponse> {
        const isRequestCancelled = requestConfig.cancelToken && axios.isCancel(error);
        const errorHandlingStrategy = requestConfig.strategy || this.strategy;

        // By default cancelled requests aren't rejected
        if (isRequestCancelled && !requestConfig.rejectCancelled) {
            return this.defaultResponse;
        }

        if (errorHandlingStrategy === 'silent') {
            // Hang the promise
            await new Promise(() => null);

            return this.defaultResponse;
        }

        // Simply rejects a request promise
        if (errorHandlingStrategy === 'reject' || errorHandlingStrategy === 'throwError') {
            return Promise.reject(error);
        }

        return this.defaultResponse;
    }

    /**
     * Output error response depending on chosen strategy
     *
     * @param {Error} error                     Error instance
     * @param {EndpointConfig} requestConfig    Per endpoint request config
     * @returns {*}                             Error response
     */
    public isRequestCancelled(error: Error, requestConfig: EndpointConfig): boolean {
        return requestConfig.cancelToken && axios.isCancel(error);
    }

    /**
     * Automatically Cancel Previous Requests
     *
     * @param {string} type                    Request type
     * @param {string} url                     Request url
     * @param {EndpointConfig} requestConfig   Per endpoint request config
     * @returns {AxiosInstance} Provider's instance
     */
    protected addCancellationToken(type: string, url: string, requestConfig: EndpointConfig) {
        // Both disabled
        if (!this.cancellable && !requestConfig.cancellable) {
            return {};
        }

        // Explicitly disabled per request
        if (typeof requestConfig.cancellable !== "undefined" && !requestConfig.cancellable) {
            return {};
        }

        const key = `${type}-${url}`;
        const previousRequest = this.requestsQueue.get(key);

        if (previousRequest) {
            previousRequest.cancel();
        }

        const tokenSource = axios.CancelToken.source();

        this.requestsQueue.set(key, tokenSource);

        const mappedRequest = this.requestsQueue.get(key) || {};

        return mappedRequest.token ? {
            cancelToken: mappedRequest.token
        } : {};
    }

    /**
     * Handle Request depending on used strategy
     *
     * @param {object} payload                      Payload
     * @param {string} payload.type                 Request type
     * @param {string} payload.url                  Request url
     * @param {*} payload.data                      Request data
     * @param {EndpointConfig} payload.config       Request config
     * @throws {Error}
     * @returns {Promise} Response Data
     */
    protected async handleRequest({
        type,
        url,
        data = null,
        config = null,
    }: IRequestData): Promise<IRequestResponse> {
        let response = null;
        const endpointConfig = config || {};
        let requestConfig = this.buildRequestConfig(type, url, data, endpointConfig);

        requestConfig = {
            ...this.addCancellationToken(type, url, requestConfig),
            ...requestConfig,
        };

        try {
            response = await this.requestInstance.request(requestConfig);
        } catch (error) {
            this.processRequestError(error);

            return this.outputErrorResponse(error, requestConfig);
        }

        return this.processResponseData(response);
    }

    /**
     * Process request response
     *
     * @param response Response object
     * @returns {*} Response data
     */
    protected processResponseData(response) {
        if (response.data) {
            if (!this.flattenResponse) {
                return response;
            }

            // Special case of data property within Axios data object
            // This is in fact a proper response but we may want to flatten it
            // To ease developers' lives when obtaining the response
            if (typeof response.data === 'object' && typeof response.data.data !== "undefined" && Object.keys(response.data).length === 1) {
                return response.data.data;
            }

            return response.data;
        }

        return this.defaultResponse;
    }
}
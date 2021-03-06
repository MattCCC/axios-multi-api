# Axios Multi API

[npm-url]: https://npmjs.org/package/axios-multi-api
[npm-image]: http://img.shields.io/npm/v/axios-multi-api.svg

[![NPM version][npm-image]][npm-url] [![Blazing Fast](https://badgen.now.sh/badge/speed/blazing%20%F0%9F%94%A5/green)](https://github.com/MattCCC/axios-multi-api) [![Code Coverage](https://badgen.now.sh/badge/coverage/94.53/blue)](https://github.com/MattCCC/axios-multi-api) [![npm downloads](https://img.shields.io/npm/dm/axios-multi-api.svg?style=flat-square)](http://npm-stat.com/charts.html?package=axios-multi-api) [![install size](https://packagephobia.now.sh/badge?p=axios-multi-api)](https://packagephobia.now.sh/result?p=axios-multi-api)

Oftentimes projects require complex APIs setups, middlewares and another stuff to accomodate a lot of API requests. Axios API Handler simplifies API handling to the extent that developers can focus on operating on the fetched data from their APIs rather than on complex initial setups.

This package helps in handling of many API endpoints in a simple, declarative fashion. It also aims to provide a possibility to use a global error handling in an easy manner.

You can set up multiple API handlers for different sets of APIs from different services. This provides much better scalability for many projects.

> If you’re new to Axios, please checkout [this handy Axios readme](https://github.com/axios/axios)

Package was originally written to accomodate many API requests in an orderly fashion.

## Table of Contents

- [Features](#features)
- [ToDo](#todo)
- [Installation](#installation)
- [Usage](#usage)
- [API methods](#api-methods)
- [Accessing Axios instance](#accessing-axios-instance)
- [Global Settings](#global-settings)
- [Per Endpoint Settings](#per-endpoint-settings)
- [Full TypeScript support](#full-typescript-support)
- [Advanced example](#advanced-example)
- [Support & collaboration](#support-collaboration)


## Features
- Multi APIs support
- Global error handler for requests
- Automatically cancel previous requests
- Multiple response resolving strategies
- Dynamic urls support
- Multiple requests chaining (using promises)
- Browsers & Node 12+ compatible
- TypeScript compatible
- All Axios options are supported
- 4.42 KB gzipped

## Todo
- Per request cache (localstorage/sessions)
- Full fetch() API support

Please open an issue for future requests!

## Installation
[![NPM](https://nodei.co/npm/axios-multi-api.png)](https://npmjs.org/package/axios-multi-api)

Run following command to install the package:
```bash
npm i axios-multi-api
```

## Usage

```typescript
import { createApiFetcher } from 'axios-multi-api';

const api = createApiFetcher({
    apiUrl: 'https://example.com/api/',
    apiEndpoints: {
      getUserDetails: {
        method: 'get',
        url: '/user-details/get',
      },
      updateUserDetails: {
        method: 'post',
        url: '/user-details/update/:userId',
      },
    },
    // Optional
    onError(error) {
      console.log('Request failed', error);
    }
});

const data = api.getUserDetails({ userId: 1 });

api.updateUserDetails({ name: 'Mark' }, { userId: 1 });
```
In this basic example we fetch data from an API for user with an ID of 1. We also update user's name to Mark. If you prefer OOP you can import `ApiHandler` and initialize the handler using `new ApiHandler()` instead.

## API methods
##### api.yourEndpointName(queryParams, urlParams, requestConfig)

`queryParams` / `payload` (optional)

First argument of APIs functions is an object with query params for `GET` requests, or with a payload for `POST` requests. Another request types are supported as well.

Query params accepts strings, numbers, and even arrays so you pass { foo: [1, 2] } and it will become: foo[]=1&foo[]=2 automatically.

`urlParams` (optional)

It gives possibility to modify urls structure in a declarative way. In our example `/user-details/update/:userId` will become `/user-details/update/1` when API request will be made.

`requestConfig` (optional)

Axios compatible [Request Config](https://github.com/axios/axios#request-config) for particular endpoint. It will overwrite the global settings.

You can also specify following argument: `cancellable` so to have more granular control over specific endpoints.

##### api.getInstance()

When API handler is firstly initialized, a new Axios instance is created. You can call `api.getInstance()` if you want to get that instance directly, for example to add some interceptors.

## Global Settings

Global settings are passed to `createApiFetcher()` function. You can pass all [Axios Request Config](https://github.com/axios/axios#request-config). Additional options are listed below.

| Option        | Type    | Default | Description                                                                                                                                                                                                                                               |
| ------------- | ------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apiUrl | string |     | Your API base url. |
| apiEndpoints | object |  | List of your endpoints. Check [Per Endpoint Settings](#per-endpoint-settings) for options. |
| strategy | string | `silent` | Error handling strategies - basically what to return when an error occurs. It can be a default data, promise can be hanged (nothing would be returned) or rejected so to use try/catch. Available: `silent`, `reject`, `defaultResponse`<br><br>`silent` can be used for a requests that are dispatched within asynchronous wrapper functions. If a request fails, promise will silently hang and no action will be performed. It will never be resolved or rejected when there is an error. Please remember that this is not what Promises were made for, however if used properly it saves developers from try/catch or additional response data checks everywhere. You can use is in combination with `onError` so to handle errors globally.<br><br>`reject` will simply reject the promise. Global error handling will be triggered right before the rejection. You will need to remember to set try/catch per each request to catch exceptions properly.<br><br>`defaultResponse` will return defaultResponse specified in either global or per endpoint settings. Promise will not be rejected but simply pass and return the object. It could be used together with destructuring to provide a responsible defaults. |
| cancellable | boolean | `false` | If set to `true` any previously dispatched requests to same url & of method will be cancelled, if a successive request is made meanwhile. This let's you avoid unnecessary requests to the backend. |
| flattenResponse | boolean | `true` | Flattens nested response.data so you can avoid writing `response.data.data` and obtain response directly. Response is flattened whenever there is a "data" within response "data", and no other object properties set. |
| defaultResponse | any | `null` | Default response when there is no data or when endpoint fails depending on the chosen `strategy` |
| timeout | int | `30000` | You can set a timeout in milliseconds. |
| logger | object | `console` | You can additionally specify logger object with your custom logger to automatically log the errors to the console. It should contain at least `error` and `warn` functions. `console.log` is used by default. |
| onError | function | | You can specify a function or class that will be triggered when an endpoint fails. If it's a class it should expose a `process` method. Axios Error Object will be sent as a first argument of it. |

## Per Endpoint Settings

Each endpoint in `apiEndpoints` is an object that accepts properties below. You can also pass these options as a 3rd argument when calling an endpoint so to have a more granular control.


| Option | Type   | Default | Description        |
| ------ | ------ | ------- | ------------------ |
| method | string |         | Default request method e.g. GET, POST etc. Must be lowercase. |
| url | string |         | Url path e.g. /user-details/get |
| cancellable | boolean | `false` | Whether previous requests should be automatically cancelled. See global settings for more info. |
| rejectCancelled | boolean | `false` | If `true` and request is set to `cancellable`, a cancelled request promise will be rejected. By default instead of rejecting the promise, `defaultResponse` from global options is returned. |
| defaultResponse | any | `null` | Default response when there is no data or when endpoint fails depending on a chosen `strategy` |
| strategy | string | | You can control strategy per each request. Global strategy is applied by default. |

## Full TypeScript support

Axios-multi-api includes necessary [TypeScript](http://typescriptlang.org) definitions. For full TypeScript support for your endpoints, you could overwrite interface using Type Assertion of your `ApiHandler` and use your own for the API Endpoints provided.

### Example of interface

```typescript
import {
  Endpoints,
  Endpoint,
  APIQueryParams,
  APIUrlParams,
} from 'axios-multi-api/dist/types/api';

import { createApiFetcher } from 'axios-multi-api';

interface myQueryParams {
  newMovies: boolean;
}

interface EndpointsList extends Endpoints {
  fetchMovies: Endpoint<myQueryParams, myURLParams, myResponse>;

  // Or you can use just Endpoint
  fetchTVSeries: Endpoint;
}

const api = (createApiFetcher({
  // Your config
}) as unknown) as EndpointsList;

// Will return an error since "newMovies" should be a boolean
api.fetchMovies( { newMovies: 1 } );

```

Package ships interfaces with responsible defaults making it easier to add new endpoints. It exposes `Endpoints` and `Endpoint` types.

## Advanced example

You could for example create an API service class that extends the handler, inject an error service class to handle with a store that would collect the errors.

As you may notice there's also a `setupInterceptor` and `httpRequestHandler` exposed. You can operate on it instead of requesting an Axios instance prior the operation. This way you can use all Axios settings for a particular API handler.


```typescript
import { ApiHandler } from 'axios-multi-api';

class MyCustomHttpRequestError {
  public constructor(myCallback) {
    this.myCallback = myCallback
  }

  public process(error) {
    this.myCallback('Request error', error);
  }
}

class ApiService extends ApiHandler {
    /**
     * Creates an instance of Api Service.
     * @param {object}  payload                   Payload
     * @param {string}  payload.apiUrl            Api url
     * @param {string}  payload.apiEndpoints      Api endpoints
     * @param {*}       payload.logger                 Logger instance
     * @param {*}       payload.myCallback             Callback function, could be a dispatcher that e.g. forwards error data to a store
     */
    public constructor({
        apiUrl,
        apiEndpoints,
        logger,
        myCallback,
    }) {
        // Pass settings to API Handler
        super({
            apiUrl,
            apiEndpoints,
            logger,
            onError: new MyCustomHttpRequestError(myCallback),
        });

        this.setupInterceptor();
    }

    /**
     * Setup Request Interceptor
     * @returns {void}
     */
    protected setupInterceptor(): void {
        this.getInstance().interceptRequest(onRequest);
    }
}

const api = new ApiService({
  // Your config
});
```

## Support & collaboration

If you have any idea for an improvement, please file an issue. Feel free to make a PR if you are willing to collaborate on the project. Thank you :)

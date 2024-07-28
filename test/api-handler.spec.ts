/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { mockErrorCallbackClass } from './request-error-handler.spec';
import { endpoints } from './mocks/endpoints';
import { createApiFetcher } from '../src';

describe('API Handler', () => {
  const apiUrl = 'http://example.com/api/';
  const config = {
    fetcher: axios,
    apiUrl,
    endpoints,
    onError: new mockErrorCallbackClass(),
  };
  const userDataMock = { name: 'Mark', age: 20 };

  console.warn = jest.fn();
  console.error = jest.fn();

  afterEach((done) => {
    done();
  });

  it('getInstance() - should obtain method of the API request provider', () => {
    const api = createApiFetcher(config);

    expect(typeof (api.getInstance() as any).request).toBe('function');
  });

  describe('get()', () => {
    it('should trigger request handler for an existent endpoint', async () => {
      const api = createApiFetcher(config);

      jest
        .spyOn(api, 'handleRequest')
        .mockResolvedValueOnce(userDataMock as any);

      const response = await api.getUser({ userId: 1 });

      expect(api.handleRequest).toHaveBeenCalledTimes(1);
      expect(api.handleRequest).toHaveBeenCalledWith('getUser', {
        userId: 1,
      });
      expect(response).toBe(userDataMock);
    });

    it('should not trigger request handler for non-existent endpoint', async () => {
      const api = createApiFetcher(config);

      api.handleRequest = jest.fn().mockResolvedValueOnce(userDataMock);

      const response = await (api as any).getUserAddress({
        userId: 1,
      });

      expect(api.handleRequest).not.toHaveBeenCalled();
      expect(response).toBeNull();
    });
  });

  describe('handleRequest()', () => {
    it('should properly dispatch request', async () => {
      const api = createApiFetcher(config);
      const uriParams = {
        id: 1,
        name: 'Mark',
      };

      jest
        .spyOn(api.requestHandler, 'handleRequest')
        .mockResolvedValueOnce(userDataMock as any);

      const response = await api.getUserByIdAndName(null, uriParams);

      expect(api.requestHandler.handleRequest).toHaveBeenCalledTimes(1);
      expect(api.requestHandler.handleRequest).toHaveBeenCalledWith(
        '/user-details/:id/:name',
        null,
        { url: '/user-details/:id/:name', uriParams },
      );
      expect(response).toBe(userDataMock);
    });

    it('should properly call an endpoint with custom headers', async () => {
      const api = createApiFetcher(config);
      const uriParams = {
        id: 1,
        name: 'Mark',
      };

      const headers = {
        'Content-Type': 'application/json',
      };

      jest
        .spyOn(api.requestHandler, 'handleRequest')
        .mockResolvedValueOnce(userDataMock as any);

      const response = await api.getUserByIdAndName(null, uriParams, {
        headers,
      });

      expect(api.requestHandler.handleRequest).toHaveBeenCalledTimes(1);
      expect(api.requestHandler.handleRequest).toHaveBeenCalledWith(
        '/user-details/:id/:name',
        null,
        { url: '/user-details/:id/:name', headers, uriParams },
      );
      expect(response).toBe(userDataMock);
    });
  });
});

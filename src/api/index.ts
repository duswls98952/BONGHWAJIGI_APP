import { settings } from '../config';
import { getAccessToken } from '../platform/storage';
import { createApi } from './client';
import { createHttpTransport } from './http';
import { createMockServer } from './mock';
export const mockServer = createMockServer();
export const api = createApi(settings.mode === 'mock' ? mockServer.transport : createHttpTransport(settings.baseUrl, getAccessToken));

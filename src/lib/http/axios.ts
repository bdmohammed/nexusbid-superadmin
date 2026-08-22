import axios from "axios";

import { clientEnv } from "@/env/client";

import { AXIOS_CONFIG, CONTENT_TYPES, HTTP_HEADERS } from "./constants";
import { requestInterceptor } from "./interceptors/request";
import { setupResponseInterceptor } from "./interceptors/response";

export const apiClient = axios.create({
  baseURL: `${clientEnv.NEXT_PUBLIC_API_URL}/api/v1`,
  timeout: AXIOS_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: {
    [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
  },
});

/**
 * Register Request Interceptor
 */
apiClient.interceptors.request.use(requestInterceptor);

/**
 * Register Response Interceptor
 */
setupResponseInterceptor(apiClient);

export default apiClient;

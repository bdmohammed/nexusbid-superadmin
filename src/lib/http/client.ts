import axios from "axios";
import { clientEnv } from "@/env/client";
import { AXIOS_CONFIG, CONTENT_TYPES, HTTP_HEADERS } from "./constants";

/**
 * Raw Axios Client
 *
 * No interceptors.
 * Used internally by:
 * - csrf.ts
 * - refresh.ts
 *
 * Never import this directly in features.
 */
export const httpClient = axios.create({
  baseURL: `${clientEnv.NEXT_PUBLIC_API_URL}/api/v1`,
  timeout: AXIOS_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: {
    [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
  },
});

export default httpClient;

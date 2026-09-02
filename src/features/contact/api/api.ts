import type { ContactDto } from '../types';
import type { ApiResponse } from '@/types';
import { apiClient } from '@/lib/http';

export const supportApi = {
  submitContact(dto: ContactDto) {
    return apiClient.post<ApiResponse<null>>('/support/contact', dto);
  },
};

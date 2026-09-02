import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('*/api/v1/auth/csrf-token', () => {
    return HttpResponse.json({
      success: true,
      data: {
        csrfToken: 'mock-csrf-token-12345',
      },
    });
  }),
  http.get('*/api/v1/auth/me', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 'usr_admin_1',
        name: 'Admin User',
        email: 'admin@rfpnexa.com',
        role: 'ADMIN',
      },
    });
  }),
];

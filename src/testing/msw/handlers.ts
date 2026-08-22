import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/auth/me', () => {
    return HttpResponse.json({
      id: 'usr_admin_1',
      name: 'Admin User',
      email: 'admin@rfpnexa.com',
      role: 'ADMIN',
    });
  }),
];

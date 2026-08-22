import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { proxy } from '../proxy';

describe('App Proxy Unit Test', () => {
  it('redirects unauthenticated user accessing /dashboard to /login', () => {
    const req = new NextRequest('http://localhost:3002/dashboard');
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login?redirect=%2Fdashboard');
  });

  it('allows access to public route /login without token', () => {
    const req = new NextRequest('http://localhost:3002/login');
    const res = proxy(req);

    expect(res.status).toBe(200);
  });
});

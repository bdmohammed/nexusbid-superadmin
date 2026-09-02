import type { AuditQuery, SecurityEventsQuery } from '../types';

export const auditQueryKeys = {
  all: ['audit-logs'] as const,
  logs: (query?: AuditQuery) => [...auditQueryKeys.all, 'list', query] as const,
  statistics: () => [...auditQueryKeys.all, 'statistics'] as const,
  security: (query?: SecurityEventsQuery) => [...auditQueryKeys.all, 'security', query] as const,
  retention: () => [...auditQueryKeys.all, 'retention'] as const,
  correlation: (correlationId: string) =>
    [...auditQueryKeys.all, 'correlation', correlationId] as const,
  request: (requestId: string) => [...auditQueryKeys.all, 'request', requestId] as const,
  details: (id: string) => [...auditQueryKeys.all, 'details', id] as const,
};

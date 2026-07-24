export const categoryQueryKeys = {
    all: ['categories'] as const,

    list: (query?: any) => [...categoryQueryKeys.all, 'list', query] as const,
    stats: () => [...categoryQueryKeys.all, 'stats'] as const,
    history: (id: string) => [...categoryQueryKeys.all, 'history', id] as const,
    governance: (id: string) => [...categoryQueryKeys.all, 'governance', id] as const,
    usage: (id: string) => [...categoryQueryKeys.all, 'usage', id] as const,
};
export const tenderQueryKeys = {
    all: ['tenders'] as const,

    list: (query?: unknown) =>
        [...tenderQueryKeys.all, 'list', query] as const,

    detail: (slug: string) =>
        [...tenderQueryKeys.all, 'detail', slug] as const,
};
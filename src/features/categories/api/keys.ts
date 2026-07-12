export const categoryQueryKeys = {
    all: ['categories'] as const,

    list: (
        query?: {
            search?: string;
            code?: string;
            slug?: string;
        },
    ) => [...categoryQueryKeys.all, 'list', query] as const,
};
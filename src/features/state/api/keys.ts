export const lookupQueryKeys = {
    all: ['lookups'] as const,
    states: () =>
        [...lookupQueryKeys.all, 'states'] as const,
    stateList: (query?: unknown) =>
        [...lookupQueryKeys.states(), query] as const,
    countries: () =>
        [...lookupQueryKeys.all, 'countries'] as const,
};
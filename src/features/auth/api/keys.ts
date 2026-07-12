export const authQueryKeys = {
    all: ['auth'] as readonly ['auth'],
    me: () => [...authQueryKeys.all, 'me'] as readonly [...typeof authQueryKeys.all, 'me'],
    session: () => [...authQueryKeys.all, 'session'] as readonly [...typeof authQueryKeys.all, 'session'],
};
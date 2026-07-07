import { useMutation } from '@tanstack/react-query';

import { tenderApi } from './api';

export function useDownloadTender() {
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await tenderApi.getDownloadUrl(id);
            //@ts-ignore
            return data.data.downloadUrl;
        },
    });
}
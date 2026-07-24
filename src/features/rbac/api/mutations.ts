import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rbacApi } from './api';
import { rbacKeys } from './keys';
import { UpdateRoleDto, CreateRoleDto, CreateAssignmentDto } from '../types';
import { AppError, ErrorCode } from '@/lib/errors';

export function useCreateRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dto: CreateRoleDto) => {
            const { data } = await rbacApi.createRole(dto);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: rbacKeys.all,
            });
        },
    });
}

export function useUpdateRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data: dto,
        }: {
            id: string;
            data: UpdateRoleDto;
        }) => {
            const { data } = await rbacApi.updateRole(id, dto);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: rbacKeys.all,
            });

            queryClient.invalidateQueries({
                queryKey: rbacKeys.role(variables.id),
            });
        },
    });
}

export function useDeleteRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await rbacApi.deleteRole(id);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: rbacKeys.all,
            });
        },
    });
}

export function useCreateAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dto: CreateAssignmentDto) => {
            const { data } = await rbacApi.createAssignment(dto);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: rbacKeys.all,
            });
        },
    });
}

export function useDeleteAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await rbacApi.deleteAssignment(id);
            if (!data.success) {
                throw new AppError(data.message, 400, data.error as ErrorCode);
            }
            return data.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: rbacKeys.all,
            });
        },
    });
}
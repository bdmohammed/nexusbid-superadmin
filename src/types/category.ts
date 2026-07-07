export interface Category {
    id: string;
    code: string;
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdByUser?: {
        id: string;
        name: string;
        email: string;
    } | null;
    activeTenderCount?: number;
    createdAt: string;
    updatedAt: string;
}
export const notificationQueryKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationQueryKeys.all, "list"] as const,
  list: (filters: any) => [...notificationQueryKeys.lists(), filters] as const,
  stats: () => [...notificationQueryKeys.all, "stats"] as const,
  categories: () => [...notificationQueryKeys.all, "categories"] as const,
  preferences: () => [...notificationQueryKeys.all, "preferences"] as const,
};

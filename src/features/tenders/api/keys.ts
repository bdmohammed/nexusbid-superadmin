export const tenderQueryKeys = {
  all: ["tenders"] as const,

  list: (query?: unknown) => [...tenderQueryKeys.all, "list", query] as const,

  detail: (slug: string) => [...tenderQueryKeys.all, "detail", slug] as const,

  statistics: () => [...tenderQueryKeys.all, "statistics"] as const,

  adminList: (query?: unknown) =>
    [...tenderQueryKeys.all, "admin", "list", query] as const,

  adminDetail: (id: string) =>
    [...tenderQueryKeys.all, "admin", "detail", id] as const,

  history: (id: string) =>
    [...tenderQueryKeys.all, "admin", "history", id] as const,

  diff: (id: string) => [...tenderQueryKeys.all, "admin", "diff", id] as const,

  reports: (reportType: "budget" | "status" | "vendors" | "performance") =>
    [...tenderQueryKeys.all, "admin", "reports", reportType] as const,
};

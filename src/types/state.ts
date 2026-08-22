export interface State {
  id: string;
  code: string;
  name: string;
  slug: string;
  type: "state" | "territory" | "federal";
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

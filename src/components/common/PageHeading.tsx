import type { ReactNode } from "react";

export interface PageHeadingProps {
  title: string;
  description?: ReactNode;
}

export default function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold">{title}</h1>
      {description && <p className="text-gray-500 mt-1">{description}</p>}
    </div>
  );
}

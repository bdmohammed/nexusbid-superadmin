import type { UserDetails } from "@/types";

export interface UserInformationProps {
  user: UserDetails;
}

export default function UserInformation({ user }: UserInformationProps) {
  const details = [
    { label: "Full Name", value: `${user.firstName} ${user.lastName}` },
    { label: "Email", value: user.email },
    { label: "Mobile", value: user.phone },
    { label: "Company", value: user.company },
    { label: "Designation", value: user.designation },
    { label: "Address", value: user.address },
    { label: "City", value: user.city },
    { label: "Country", value: user.country },
    { label: "Joined On", value: user.joined },
    { label: "Last Login", value: user.lastLogin },
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-lg font-semibold">Personal Information</h3>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-2">
        {details.map((item) => (
          <div key={item.label}>
            <p className="text-sm text-text-light">{item.label}</p>
            <p className="mt-1 font-medium text-text">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

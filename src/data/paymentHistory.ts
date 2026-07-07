import type { PaymentHistory, PaymentStatus } from "@/types";

const companies = [
  "Acme Corp",
  "Global Logistics",
  "TechNova Inc",
  "Solaris Dynamics",
  "Vertex Solutions",
  "BluePeak Ltd",
  "Future Systems",
  "BuildCore",
  "Nexus Group",
  "Skyline Tech",
  "Quantum Labs",
  "Prime Ventures",
  "InnovateX",
  "Apex Industries",
  "CloudMatrix",
  "Zenith Corp",
  "BrightPath",
  "CoreTech",
  "DigitalWave",
  "NovaEdge",
  "VisionWorks",
  "Orbit Systems",
  "NextGen Solutions",
  "Titan Industries",
  "Fusion Labs",
  "GreenLeaf",
  "Alpha Networks",
  "Delta Corp",
  "SmartGrid",
  "UrbanTech",
  "RapidSoft",
  "Elite Systems",
  "NorthStar",
  "BlueOcean",
  "LogicWorks",
  "Infinity Tech",
  "Velocity Labs",
  "Peak Solutions",
  "DataBridge",
  "HyperScale",
];

const paymentHistory: PaymentHistory[] = companies.map((company, index) => {
  const plan = ["Starter", "Professional", "Enterprise"][index % 3];
  const amount = ["$499", "$1,299", "$12,500"][index % 3];
  const status: PaymentStatus = ["Paid", "Pending", "Overdue"][
    index % 3
  ] as PaymentStatus;
  return {
    id: index + 1,
    invoice: `INV-${9400 - index}`,
    company,
    companyShort: company
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    plan,
    amount,
    status,
    date: `${String((index % 28) + 1).padStart(2, "0")} Oct 2023`,
  };
});

export default paymentHistory;

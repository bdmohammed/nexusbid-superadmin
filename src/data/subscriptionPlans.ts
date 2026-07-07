import type { SubscriptionPlan } from "@/types";

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 1,
    name: "Starter",
    subtitle: "For small procurement teams",
    price: "$499",
    duration: "/month",
    buttonText: "Edit Plan",
    featured: false,
    features: [
      "Up to 5 Active Tenders",
      "Basic Vendor Analytics",
      "Email Support",
    ],
  },
  {
    id: 2,
    name: "Professional",
    subtitle: "Scaling marketplace operations",
    price: "$1,299",
    duration: "/month",
    buttonText: "Edit Plan",
    featured: true,
    badge: "Most Popular",
    features: [
      "Unlimited Tenders",
      "Advanced AI Scoring",
      "Custom Branding",
      "24/7 Priority Support",
    ],
  },
  {
    id: 3,
    name: "Enterprise",
    subtitle: "Bespoke solutions for global firms",
    price: "Custom",
    duration: "",
    buttonText: "Contact Sales",
    featured: false,
    features: [
      "Dedicated Account Manager",
      "SLA Guarantees",
      "SSO & Advanced Security",
      "On-premise Deployment",
    ],
  },
];

export default subscriptionPlans;

import {
  Wallet,
  Users,
  UserMinus,
} from "lucide-react";

const subscriptionStats = [
  {
    id: 1,
    title: "Total ARR",
    value: "$4,280,000",
    description: "Compared to $3.8M last year",
    icon: Wallet,
    trend: "+12.5%",
    trendType: "success",
  },
  {
    id: 2,
    title: "Active Subscriptions",
    value: "1,452",
    description: "112 new this month",
    icon: Users,
    trend: "+8.2%",
    trendType: "success",
  },
  {
    id: 3,
    title: "Churn Rate",
    value: "2.1%",
    description: "Industry benchmark 3.5%",
    icon: UserMinus,
    trend: "-0.4%",
    trendType: "danger",
  },
];

export default subscriptionStats;
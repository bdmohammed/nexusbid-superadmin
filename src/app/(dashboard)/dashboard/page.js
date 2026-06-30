import DashboardStats from "@/components/dashboard/DashboardStats";
import MonthlySales from "@/components/dashboard/MonthlySales";
import StatisticsChart from "@/components/dashboard/StatisticsChart";
import MonthlyTarget from "@/components/dashboard/MonthlyTarget";
import RecentOrders from "@/components/dashboard/RecentOrders";
import CustomerDemographics from "@/components/dashboard/CustomerDemographics";

export default function Dashboard() {
  return (
    <div className="space-y-6">

      <DashboardStats />

      <MonthlySales />

      <StatisticsChart />

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">

        <MonthlyTarget />

        <RecentOrders />

      </div>
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <CustomerDemographics />
      </div>

    </div>
  );
}
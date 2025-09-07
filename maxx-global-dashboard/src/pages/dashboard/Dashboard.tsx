// src/pages/dashboard/Dashboard.tsx
import OverviewCards from "./components/OverviewCards";
import RecentActivities from "./components/RecentActivities";
import TopProductsChart from "./components/TopProductsChart";
import TopDealersChart from "./components/TopDealersChart";
import RevenueTrendChart from "./components/RevenueTrendChart";
import MonthlyOrdersChart from "./components/MonthlyOrdersChart";
import DiscountEffectivenessChart from "./components/DiscountEffectivenessChart";

export default function Dashboard() {
  return (
    <div className="row mg-top-10">
      {/* Top cards */}
      <OverviewCards />

      {/* Recent activities */}

      {/* Charts */}
      <TopProductsChart />
      <TopDealersChart />
      <RecentActivities />
      <RevenueTrendChart />
      <MonthlyOrdersChart />
      <DiscountEffectivenessChart />
    </div>
  );
}

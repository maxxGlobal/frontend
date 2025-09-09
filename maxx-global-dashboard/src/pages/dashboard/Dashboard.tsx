// src/pages/dashboard/Dashboard.tsx
import OverviewCards from "./components/OverviewCards";
import RecentActivities from "./components/RecentActivities";
import TopProductsChart from "./components/TopProductsChart";
import TopDealersChart from "./components/TopDealersChart";
import RevenueTrendChart from "./components/RevenueTrendChart";
import MonthlyOrdersChart from "./components/MonthlyOrdersChart";
import DiscountEffectivenessChart from "./components/DiscountEffectivenessChart";
import { RefreshCw } from "lucide-react";
import LowStockProductsPage from "../products/LowStockProductsPage";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshDashboard } from "../../services/dashboard/refresh";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function Dashboard() {
  const qc = useQueryClient();

  const refreshMutation = useMutation({
    mutationFn: refreshDashboard,
    onSuccess: async (msg: string) => {
      await MySwal.fire({
        icon: "success",
        title: "Başarılı",
        text: msg || "Anasayfa başarıyla yenilendi.",
        timer: 1800,
        showConfirmButton: false,
      });

      await Promise.allSettled([
        qc.invalidateQueries({ queryKey: ["dashboard"] }),
        qc.invalidateQueries({ queryKey: ["dashboard", "stats"] }),
        qc.invalidateQueries({ queryKey: ["dashboard", "recent-orders"] }),
        qc.invalidateQueries({ queryKey: ["notifications", "summary"] }),
        qc.invalidateQueries({ queryKey: ["products", "low-stock"] }),
      ]);
    },
    onError: async () => {
      await MySwal.fire({
        icon: "error",
        title: "Hata",
        text: "Anasayfa yenilenirken bir sorun oluştu.",
      });
    },
  });

  return (
    <div className="row mg-top-10">
      {/* Header + Refresh */}
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center my-4 mb-5">
          <h2 className="sherah-heading__title mb-0">Anasayfa</h2>
          <button
            onClick={() => refreshMutation.mutate(undefined)}
            disabled={refreshMutation.isPending}
            className={`d-flex items-center border-0 gap-2 px-4 py-2 rounded-lg text-white  transition 
    ${refreshMutation.isPending ? "bg-success" : "bg-success"}`}
          >
            {refreshMutation.isPending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Yenileniyor...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Yenile
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top cards */}
      <OverviewCards />

      {/* Charts */}
      <TopProductsChart />
      <TopDealersChart />

      {/* Recent activities & low stock */}
      <RecentActivities />
      <LowStockProductsPage />

      {/* Rest of charts */}
      <RevenueTrendChart />
      <MonthlyOrdersChart />
      <DiscountEffectivenessChart />
    </div>
  );
}

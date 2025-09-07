// src/pages/dashboard/components/DiscountEffectivenessChart.tsx
import { useEffect, useState } from "react";
import { listDiscountEffectiveness } from "../../../services/dashboard/discountEffectiveness";
import type { DiscountEffectiveness } from "../../../types/dashboard";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DiscountEffectivenessChart() {
  const [dataSet, setDataSet] = useState<DiscountEffectiveness | null>(null);

  useEffect(() => {
    listDiscountEffectiveness().then(setDataSet).catch(console.error);
  }, []);

  const discounts = dataSet?.discounts ?? [];

  const data = {
    labels: discounts.map((d: any) => d.name ?? "Unnamed"),
    datasets: [
      {
        label: "Kullanım",
        data: discounts.map((d: any) => d.usageCount ?? 0),
        backgroundColor: "#0A9396",
      },
      {
        label: "Gelir",
        data: discounts.map((d: any) => d.revenueImpact ?? 0),
        backgroundColor: "#94D2BD",
      },
    ],
  };

  if (discounts.length === 0) {
    return (
      <div className="col-lg-6 col-12">
        <div className="charts-main sherah-default-bg sherah-border mg-top-30">
          <div className="charts-main__heading mg-btm-20">
            <h3 className="sherah-heading__title">En Etkili İndirimler</h3>
          </div>
          <p className="p-3">İndirim Verisi Mevcut Değil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-6 col-12">
      <div className="charts-main sherah-default-bg sherah-border mg-top-30">
        <div className="charts-main__heading mg-btm-20">
          <h3 className="sherah-heading__title">En Etkili İndirimler</h3>
        </div>
        <div className="sherah-chart__inside sherah-chart__discounts">
          <Bar data={data} />
        </div>
      </div>
    </div>
  );
}

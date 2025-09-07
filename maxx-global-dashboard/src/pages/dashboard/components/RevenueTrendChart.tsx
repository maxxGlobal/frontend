// src/pages/dashboard/components/RevenueTrendChart.tsx
import { useEffect, useState } from "react";
import { listRevenueTrend } from "../../../services/dashboard/revenueTrend";
import type { RevenueTrend } from "../../../types/dashboard";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { ChartOptions } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function RevenueTrendChart() {
  const [dataSet, setDataSet] = useState<RevenueTrend[]>([]);

  useEffect(() => {
    listRevenueTrend().then(setDataSet).catch(console.error);
  }, []);

  const data = {
    labels: dataSet.map((r) => r.monthName),
    datasets: [
      {
        label: "Gelir",
        data: dataSet.map((r) => r.revenue),
        borderColor: "#6176FE",
        backgroundColor: "#c7cdf3ff",
        tension: 0.4,
        fill: true,
        borderWidth: 6,
        pointBackgroundColor: "#3a489fff",
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { labels: { font: { size: 13 }, color: "#333" } },
      tooltip: {
        backgroundColor: "#001219",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: (ctx: any) => `₺ ${ctx.formattedValue}`,
        },
      },
    },
    animation: { duration: 1200, easing: "easeOutQuart" },
  };

  return (
    <div className="col-lg-6">
      <div className="charts-main sherah-default-bg sherah-border mg-top-30">
        <div className="charts-main__heading mg-btm-30">
          <h4 className="sherah-heading__title">Aylık Gelir Trendi</h4>
        </div>
        <div
          className="sherah-chart__inside sherah-chart__revenue"
          style={{ minHeight: 400 }}
        >
          <Line
            data={data}
            options={options}
            style={{ maxHeight: 400, height: 400, display: "inline" }}
          />
        </div>
      </div>
    </div>
  );
}

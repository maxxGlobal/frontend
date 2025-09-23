// src/pages/dashboard/components/MonthlyOrdersChart.tsx
import { useEffect, useState } from "react";
import { listMonthlyOrders } from "../../../services/dashboard/monthlyOrders";
import type { MonthlyOrder } from "../../../types/dashboard";
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

export default function MonthlyOrdersChart() {
  const [orders, setOrders] = useState<MonthlyOrder[]>([]);

  useEffect(() => {
    listMonthlyOrders().then(setOrders).catch(console.error);
  }, []);

  const data = {
    labels: orders.map((o) => o.monthName),
    datasets: [
      {
        label: "Sipariş",
        data: orders.map((o) => o.orderCount),
        borderColor: "#9B2226",
        backgroundColor: "rgba(155,34,38,0.3)",
        tension: 0.4,
        borderWidth: 6,
        fill: true,
        pointBackgroundColor: "#9B2226",
        pointRadius: 2,
        pointHoverRadius: 7,
      } ,
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { labels: { font: { size: 13 } } },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            ctx.dataset.label === "Sipariş"
              ? `Sipariş: ${ctx.formattedValue} `
              : ` ₺ ${ctx.formattedValue}`,
        },
      },
    },
    animation: { duration: 1200, easing: "easeOutQuart" },
  };

  return (
    <div className="col-lg-6 col-12">
      <div className="charts-main sherah-default-bg sherah-border mg-top-30">
        <div className="charts-main__heading mg-btm-20">
          <h3 className="sherah-heading__title">Aylık Sipariş Trendi</h3>
        </div>
        <div
          className="sherah-chart__inside sherah-chart__revenue"
          style={{ height: 375 }}
        >
          <Line
            data={data}
            options={options}
            style={{
              maxHeight: 410,
              height: 410,
              display: "inline",
            }}
          />
        </div>
      </div>
    </div>
  );
}

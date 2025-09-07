// src/pages/dashboard/components/TopProductsChart.tsx
import { useEffect, useState } from "react";
import { listTopProducts } from "../../../services/dashboard/topProducts";
import type { TopProduct } from "../../../types/dashboard";
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
import type { ChartOptions } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TopProductsChart() {
  const [products, setProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    listTopProducts().then(setProducts).catch(console.error);
  }, []);

  const data = {
    labels: products.map((p) => p.productName),
    datasets: [
      {
        label: "Siparişler",
        data: products.map((p) => p.orderCount),
        backgroundColor: "rgba(10,147,150,0.8)",
        borderRadius: 6,
        hoverBackgroundColor: "rgba(10,147,150,1)",
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx: any) => `Sipariş: ${ctx.formattedValue}` },
      },
    },
    animation: { duration: 1000, easing: "easeInOutCubic" },
  };

  return (
    <div className="col-lg-8 col-12">
      <div className="charts-main sherah-default-bg sherah-border mg-top-30">
        <div className="charts-main__heading mg-btm-20">
          <h4 className="sherah-heading__title">
            En Çok Sipariş Edilen Ürünler
          </h4>
        </div>
        <div className="sherah-chart__inside sherah-chart__revenue">
          <Bar data={data} options={options} style={{ maxHeight: 400 }} />
        </div>
      </div>
    </div>
  );
}

// src/pages/dashboard/components/TopDealersChart.tsx
import { useEffect, useState } from "react";
import { listTopDealers } from "../../../services/dashboard/topDealers";
import type { TopDealer } from "../../../types/dashboard";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import type { ChartOptions } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function TopDealersChart() {
  const [dealers, setDealers] = useState<TopDealer[]>([]);

  useEffect(() => {
    listTopDealers().then(setDealers).catch(console.error);
  }, []);

  const data = {
    labels: dealers.map((d) => d.dealerName),
    datasets: [
      {
        label: "Siparişler",
        data: dealers.map((d) => d.orderCount),
        backgroundColor: [
          "rgba(238,155,0,0.8)",
          "rgba(10,147,150,0.8)",
          "rgba(155,34,38,0.8)",
          "rgba(0,95,115,0.8)",
          "rgba(148,210,189,0.8)",
        ],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 12,
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: { size: 13 },
          color: "#333",
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.label}: ${ctx.formattedValue} sipariş`,
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: "easeOutQuart",
    },
  };

  return (
    <div className="col-lg-4 col-12">
      <div className="charts-main sherah-default-bg sherah-border mg-top-30">
        <div className="charts-main__heading mg-btm-20">
          <h4 className="sherah-heading__title">
            En Çok Sipariş Veren Bayiler
          </h4>
        </div>
        <div className="sherah-chart__inside sherah-chart__revenue">
          <Pie data={data} options={options} style={{ maxHeight: 400 }} />
        </div>
      </div>
    </div>
  );
}

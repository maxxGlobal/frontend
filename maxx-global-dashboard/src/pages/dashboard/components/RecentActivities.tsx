// src/pages/dashboard/components/RecentActivities.tsx
import { useEffect, useState } from "react";
import { listRecentActivities } from "../../../services/dashboard/recentActivities";
import type { RecentActivity } from "../../../types/dashboard";

export default function RecentActivities() {
  const [rows, setRows] = useState<RecentActivity[]>([]);

  useEffect(() => {
    listRecentActivities().then(setRows).catch(console.error);
  }, []);

  return (
    <div className="col-lg-12 col-12">
      <div className="sherah-table sherah-default-bg sherah-border mg-top-30 dashboard-table">
        <div className="sherah-table__heading">
          <h3 className="sherah-heading__title mb-0">Son Siparişler</h3>
        </div>

        <table className="sherah-table__main sherah-table__main--front sherah-table__main-v1">
          <thead className="sherah-table__head">
            <tr className="d-flex justify-content-between">
              <th className="sherah-table__h1">Sipariş No</th>
              <th className="sherah-table__h2">Müşteri</th>
              <th className="sherah-table__h3">Açıklama</th>
              <th className="sherah-table__h4">Tutar</th>
              <th className="sherah-table__h5">Durum</th>
              <th className="sherah-table__h6">Tarih</th>
            </tr>
          </thead>

          <tbody className="sherah-table__body">
            {rows.map((a) => {
              // description örnek: "husamm - ORD-20250904-121012-767 (42.00 TL)"
              const match = a.description.match(/^(.*?) - (.*?) \((.*?)\)$/);
              const customerName = match ? match[1] : "-";
              const orderCode = match ? match[2] : a.relatedEntityId;
              const amount = match ? match[3] : "-";

              return (
                <tr key={a.id}>
                  {/* ikon sütunu */}

                  <td>
                    <div className="sherah-table__product--id">
                      <p className="crany-table__product--number mb-0">
                        <a
                          href={a.actionUrl}
                          className="text-primary fw-semibold"
                        >
                          {orderCode}
                        </a>
                      </p>
                    </div>
                  </td>

                  <td>
                    <p className="sherah-table__product-desc mb-0">
                      {customerName}
                    </p>
                  </td>

                  <td>
                    <p className="sherah-table__product-desc mb-0">{a.title}</p>
                  </td>

                  <td>
                    <h5 className="sherah-table__inner--title mb-0">
                      {amount}
                    </h5>
                  </td>

                  <td>
                    <div
                      className={`badge text-uppercase bg-${a.color}`}
                      style={{ padding: "6px 10px" }}
                    >
                      {a.activityType}
                    </div>
                  </td>

                  <td>
                    <small className="text-muted">
                      {new Date(a.createdAt).toLocaleDateString("tr-TR")}{" "}
                      {new Date(a.createdAt).toLocaleTimeString("tr-TR")}
                    </small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

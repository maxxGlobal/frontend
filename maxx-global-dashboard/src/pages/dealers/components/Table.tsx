// src/pages/dealers/components/Table.tsx
import type { PageResponse } from "../../../types/paging";
import type { DealerRow } from "../../../types/dealer";
import type { JSX } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  data: PageResponse<DealerRow>;
  canManage: boolean;
  toggleSort: (k: keyof DealerRow) => void;
  sortIcon: (k: keyof DealerRow) => JSX.Element;
  onEdit: (d: DealerRow) => void;
  onAskDelete: (d: DealerRow) => void;
  onRestore: (d: DealerRow) => void;
  onDetail?: (r: DealerRow) => void;
};

export default function DealersTable({
  data,
  canManage,
  toggleSort,
  sortIcon,
  onEdit,
  onAskDelete,
  onRestore,
  onDetail,
}: Props) {
  const navigate = useNavigate();
  const fmtDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  };

  const statusBadge = (s?: string | null) =>
    s === "AKTİF" ? (
      <div className="sherah-table__status sherah-color3 sherah-color3__bg--opactity">
        AKTİF
      </div>
    ) : (
      <div className="sherah-table__status sherah-color2 sherah-color2__bg--opactity">
        PASİF
      </div>
    );
  return (
    <div className="sherah-table p-0">
      <table className="sherah-table__main sherah-table__main-v3">
        <thead className="sherah-table__head">
          <tr>
            <th
              onClick={() => toggleSort("name")}
              style={{ cursor: "pointer" }}
            >
              <span className="me-2">Ad</span>
              {sortIcon("name")}
            </th>
            <th>E-posta</th>
            <th>Telefon</th>

            <th>TRY</th>
            <th>USD</th>
            <th>EUR</th>
            <th>Durum</th>
            {canManage && <th>Aksiyon</th>}
          </tr>
        </thead>
        <tbody className="sherah-table__body">
          {data.content.length ? (
            data.content.map((d) => (
              <tr key={d.id}>
                <td>
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">{d.name}</p>
                  </div>
                </td>
                <td>
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">
                      {d.email || "—"}
                    </p>
                  </div>
                </td>
                <td>
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">
                      {d.mobilePhone || d.fixedPhone || "—"}
                    </p>
                  </div>
                </td>
                <td>
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">
                      {d.preferredCurrency === "TRY" ? "TRY (₺)" : "-"}
                    </p>
                  </div>
                </td>
                <td>
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">
                      {d.preferredCurrency === "USD" ? "USD ($)" : "-"}
                    </p>
                  </div>
                </td>
                <td>
                  <div className="sherah-table__product-content">
                    <p className="sherah-table__product-desc">
                      {d.preferredCurrency === "EUR" ? "EUR (€)" : "-"}
                    </p>
                  </div>
                </td>
                <td>
                  <div className="sherah-table__product-content">
                    {statusBadge(d.status)}
                  </div>
                </td>
                {canManage && (
                  <td>
                    <div className="sherah-table__product-content">
                      <div className="sherah-table__status__group justify-content-start">
                        {onDetail && (
                          <button
                            className="sherah-table__action sherah-color2 sherah-color3__bg--opactity border-0"
                            title="Detay"
                            onClick={() => onDetail(d)}
                          >
                            <i className="fa-solid fa-magnifying-glass" />
                          </button>
                        )}
                        <a
                          href="#"
                          className="sherah-table__action sherah-color2 sherah-color3__bg--opactity"
                          title="Güncelle"
                          onClick={(e) => {
                            e.preventDefault();
                            onEdit(d);
                          }}
                        >
                          <svg
                            className="sherah-color3__fill"
                            xmlns="http://www.w3.org/2000/svg"
                            width="18.29"
                            height="18.252"
                            viewBox="0 0 18.29 18.252"
                            aria-hidden="true"
                          >
                            <g transform="translate(-234.958 -37.876)">
                              <path
                                d="M242.545,95.779h-5.319a2.219,2.219,0,0,1-2.262-2.252c-.009-1.809,0-3.617,0-5.426q0-2.552,0-5.1a2.3,2.3,0,0,1,2.419-2.419q2.909,0,5.818,0c.531,0,.87.274.9.715a.741.741,0,0,1-.693.8c-.3.026-.594.014-.892.014q-2.534,0-5.069,0c-.7,0-.964.266-.964.976q0,5.122,0,10.245c0,.687.266.955.946.955q5.158,0,10.316,0c.665,0,.926-.265.926-.934q0-2.909,0-5.818a.765.765,0,0,1,.791-.853.744.744,0,0,1,.724.808c.007,1.023,0,2.047,0,3.07s.012,2.023-.006,3.034A2.235,2.235,0,0,1,248.5,95.73a1.83,1.83,0,0,1-.458.048Q245.293,95.782,242.545,95.779Z"
                                transform="translate(0 -39.652)"
                              ></path>
                              <path
                                d="M332.715,72.644l2.678,2.677c-.05.054-.119.133-.194.207q-2.814,2.815-5.634,5.625a1.113,1.113,0,0,1-.512.284c-.788.177-1.582.331-2.376.48-.5.093-.664-.092-.564-.589.157-.781.306-1.563.473-2.341a.911.911,0,0,1,.209-.437q2.918-2.938,5.853-5.86A.334.334,0,0,1,332.715,72.644Z"
                                transform="translate(-84.622 -32.286)"
                              ></path>
                              <path
                                d="M433.709,42.165l-2.716-2.715a15.815,15.815,0,0,1,1.356-1.248,1.886,1.886,0,0,1,2.579,2.662A17.589,17.589,0,0,1,433.709,42.165Z"
                                transform="translate(-182.038)"
                              ></path>
                            </g>
                          </svg>
                        </a>

                        {d.status === "AKTİF" ? (
                          <a
                            href="#"
                            className="sherah-table__action sherah-color2 sherah-color2__bg--offset"
                            title="Sil"
                            onClick={(e) => {
                              e.preventDefault();
                              onAskDelete(d);
                            }}
                          >
                            <svg
                              className="sherah-color2__fill"
                              xmlns="http://www.w3.org/2000/svg"
                              width="16.247"
                              height="18.252"
                              viewBox="0 0 16.247 18.252"
                              aria-hidden="true"
                            >
                              <g transform="translate(-160.007 -18.718)">
                                <path
                                  d="M185.344,88.136c0,1.393,0,2.786,0,4.179-.006,1.909-1.523,3.244-3.694,3.248q-3.623.007-7.246,0c-2.15,0-3.682-1.338-3.687-3.216q-.01-4.349,0-8.7a.828.828,0,0,1,.822-.926.871.871,0,0,1,1,.737c.016.162.006.326.006.489q0,4.161,0,8.321c0,1.061.711,1.689,1.912,1.69q3.58,0,7.161,0c1.2,0,1.906-.631,1.906-1.695q0-4.311,0-8.622a.841.841,0,0,1,.708-.907.871.871,0,0,1,1.113.844C185.349,85.1,185.343,86.618,185.344,88.136Z"
                                  transform="translate(-9.898 -58.597)"
                                ></path>
                                <path d="M164.512,21.131c0-.517,0-.98,0-1.443.006-.675.327-.966,1.08-.967q2.537,0,5.074,0c.755,0,1.074.291,1.082.966.005.439.005.878.009,1.317a.615.615,0,0,0,.047.126h.428c1,0,2,0,3,0,.621,0,1.013.313,1.019.788s-.4.812-1.04.813q-7.083,0-14.165,0c-.635,0-1.046-.327-1.041-.811s.4-.786,1.018-.789C162.165,21.127,163.3,21.131,164.512,21.131Zm1.839-.021H169.9v-.764h-3.551Z"></path>
                                <path
                                  d="M225.582,107.622c0,.9,0,1.806,0,2.709a.806.806,0,0,1-.787.908.818.818,0,0,1-.814-.924q0-2.69,0-5.38a.82.82,0,0,1,.81-.927.805.805,0,0,1,.79.9C225.585,105.816,225.582,106.719,225.582,107.622Z"
                                  transform="translate(-58.483 -78.508)"
                                ></path>
                                <path
                                  d="M266.724,107.63c0-.9,0-1.806,0-2.709a.806.806,0,0,1,.782-.912.818.818,0,0,1,.818.919q0,2.69,0,5.38a.822.822,0,0,1-.806.931c-.488,0-.792-.356-.794-.938C266.721,109.411,266.724,108.521,266.724,107.63Z"
                                  transform="translate(-97.561 -78.509)"
                                ></path>
                              </g>
                            </svg>
                          </a>
                        ) : (
                          <a
                            href="#"
                            className="sherah-table__action sherah-color3 sherah-color3__bg--opactity"
                            title="Geri Yükle"
                            onClick={(e) => {
                              e.preventDefault();
                              onRestore(d);
                            }}
                          >
                            <i className="fa-solid fa-rotate-left"></i>
                          </a>
                        )}
                        <a
                          href="#"
                          className="sherah-table__action sherah-color1 sherah-color1__bg--opactity"
                          title="Excel İşlemleri"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/dealers/${d.id}/prices`);
                          }}
                        >
                          <i className="fa-solid fa-file-excel"></i>
                        </a>
                      </div>
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={canManage ? 6 : 5} style={{ textAlign: "center" }}>
                Kayıt bulunamadı.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

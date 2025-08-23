// src/pages/dealers/components/Table.tsx
import type { PageResponse } from "../../../types/paging";
import type { DealerRow } from "../../../types/dealer";
import type { JSX } from "react";

type Props = {
  data: PageResponse<DealerRow>;
  canManage: boolean;
  toggleSort: (k: keyof DealerRow) => void;
  sortIcon: (k: keyof DealerRow) => JSX.Element;
  onEdit: (d: DealerRow) => void;
  onAskDelete: (d: DealerRow) => void;
  onRestore: (d: DealerRow) => void;
};

export default function DealersTable({
  data,
  canManage,
  toggleSort,
  sortIcon,
  onEdit,
  onAskDelete,
  onRestore,
}: Props) {
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
    s === "ACTIVE" ? (
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
            <th>Durum</th>
            {canManage && <th>Aksiyon</th>}
          </tr>
        </thead>
        <tbody className="sherah-table__body">
          {data.content.length ? (
            data.content.map(
              (d) => (
                console.log(data),
                (
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
                        {statusBadge(d.status)}
                      </div>
                    </td>
                    {canManage && (
                      <td>
                        <div className="sherah-table__product-content">
                          <div className="sherah-table__status__group justify-content-start">
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

                            {d.status === "ACTIVE" ? (
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
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  version="1.0"
                                  width="16.247"
                                  height="18.252"
                                  viewBox="0 0 512.000000 512.000000"
                                  preserveAspectRatio="xMidYMid meet"
                                >
                                  <g
                                    transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                    fill="#000000"
                                    stroke="none"
                                  >
                                    <path d="M3263 4835 c-69 -35 -106 -89 -111 -163 -3 -45 6 -93 42 -225 25 -93 46 -174 46 -182 0 -26 -19 -26 -107 0 -462 134 -960 100 -1402 -95 -655 -288 -1111 -907 -1201 -1630 -15 -124 -12 -383 6 -511 114 -820 704 -1489 1498 -1699 209 -55 282 -64 521 -64 235 0 322 10 520 60 688 175 1251 724 1449 1414 60 206 71 297 71 560 0 234 -1 247 -22 287 -48 88 -145 135 -235 113 -57 -15 -112 -59 -140 -113 -19 -38 -20 -53 -15 -177 19 -499 -141 -919 -477 -1256 -311 -310 -709 -474 -1151 -474 -437 0 -840 169 -1150 485 -233 236 -388 537 -447 865 -28 160 -28 391 1 554 146 827 907 1413 1739 1338 138 -13 171 -24 159 -55 -3 -8 -42 -24 -89 -37 -105 -28 -151 -53 -185 -103 -31 -45 -42 -133 -24 -190 23 -68 122 -137 197 -137 39 0 889 232 926 253 72 40 114 134 97 219 -4 24 -58 227 -118 453 -121 448 -129 469 -210 512 -59 31 -122 30 -188 -2z" />
                                  </g>
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              )
            )
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

// src/pages/dealers/DealerDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import type { Dealer, DealerUserLite } from "../../types/dealer";
import api from "../../lib/api";
import EditDealerUserModal from "../dealers/components/EditDealerUserModal";
import LoaderStyleOne from "../homepage/Helpers/Loaders/LoaderStyleOne";

export default function DealerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);

  // modal state
  const [editUser, setEditUser] = useState<DealerUserLite | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/dealers/${id}`);
        setDealer(res.data.data ?? res.data);
      } catch (e: any) {
        Swal.fire("Hata", "Bayi bilgileri yüklenemedi", "error");
        navigate("/dealers");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  async function handleDeleteUser(userId: number) {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu kullanıcı silinecek",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "Vazgeç",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/users/${userId}`);
      Swal.fire("Başarılı", "Kullanıcı silindi", "success");

      setDealer((prev) =>
        prev
          ? { ...prev, users: prev.users?.filter((u) => u.id !== userId) ?? [] }
          : prev
      );
    } catch (e: any) {
      Swal.fire("Hata", "Kullanıcı silinemedi", "error");
    }
  }

  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">
            <LoaderStyleOne />
          </span>
        </div>
      </div>
    );
  }

  if (!dealer) return null;

  return (
    <div className="sherah-page-inner sherah-default-bg sherah-border p-4">
      <div className="row mg-top-30">
        <div className="col-12 sherah-flex-between">
          <div className="sherah-breadcrumb">
            <h2 className="sherah-breadcrumb__title">Bayi Detay</h2>
            <ul className="sherah-breadcrumb__list">
              <li>
                {" "}
                <Link to="/dealers" className="">
                  Bayi Listesi
                </Link>
              </li>
              <li className="active">
                <a>Bayi Detayı</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bayi Bilgileri Tablosu */}
      <div className="col-lg-12 col-md-12 col-12">
        <div className="sherah-contact-card sherah-default-bg sherah-border mg-top-30">
          <h3 className="sherah-contact-card__title">Bayi Bilgileri</h3>

          <div className="sherah-vcard__body">
            <div className="sherah-vcard__content">
              <h4 className="sherah-vcard__title">{dealer.name}</h4>
              <ul className="sherah-vcard__contact gap-3">
                <li className="d-flex gap-2 align-items-center">
                  <svg
                    className="sherah-color1__fill"
                    xmlns="http://www.w3.org/2000/svg"
                    width="13.982"
                    height="13.981"
                    viewBox="0 0 13.982 13.981"
                  >
                    <g
                      id="Group_130"
                      data-name="Group 130"
                      transform="translate(-238.976 -32.987)"
                    >
                      <path
                        id="Path_469"
                        data-name="Path 469"
                        d="M314.822,106.483h.815v3.277h8.2v-3.294c.134,0,.241,0,.347,0,.335.012.478.156.48.492,0,.746,0,1.493,0,2.239q0,3.331,0,6.662c0,.444-.127.574-.561.574h-8.71c-.444,0-.568-.122-.568-.564q0-4.56,0-9.119Zm7.358,4.937v.006c.155,0,.31.011.464,0a.375.375,0,0,0,.373-.394.355.355,0,0,0-.335-.4,6.3,6.3,0,0,0-.979,0,.351.351,0,0,0-.318.408.361.361,0,0,0,.333.37A3.664,3.664,0,0,0,322.18,111.42Zm.021,1.645c.146,0,.292.01.436,0a.376.376,0,0,0,.379-.388.364.364,0,0,0-.356-.407,6.432,6.432,0,0,0-.926,0,.361.361,0,0,0-.35.41.374.374,0,0,0,.38.385C321.909,113.075,322.055,113.066,322.2,113.065Zm-4.922-2.033a.411.411,0,0,0-.388-.408.4.4,0,1,0-.04.8A.409.409,0,0,0,317.279,111.032Zm1.193.393a.4.4,0,1,0,.074-.8.4.4,0,1,0-.074.8Zm1.676-.8a.4.4,0,1,0,0,.8.4.4,0,1,0,0-.8Zm-2.869,2.033a.411.411,0,0,0-.43-.393.4.4,0,1,0,.042.8A.408.408,0,0,0,317.279,112.656Zm1.638.008a.412.412,0,0,0-.395-.4.4.4,0,1,0-.027.8A.409.409,0,0,0,318.917,112.663Zm1.225.4a.4.4,0,1,0,.01-.8.4.4,0,1,0-.01.8Zm-3.268,1.639a.4.4,0,1,0-.007-.8.4.4,0,1,0,.007.8Zm2.043-.4a.412.412,0,0,0-.395-.4.4.4,0,1,0-.027.8A.409.409,0,0,0,318.917,114.3Zm1.638-.01a.412.412,0,0,0-.432-.391.4.4,0,1,0,.047.8A.408.408,0,0,0,320.555,114.291Z"
                        transform="translate(-71.704 -69.466)"
                      ></path>
                      <path
                        id="Path_470"
                        data-name="Path 470"
                        d="M242.3,82.638q0,2.184,0,4.368a.984.984,0,0,1-1.1,1.112c-.391,0-.783,0-1.174,0a.959.959,0,0,1-1.044-1.032q0-4.437,0-8.873a1.66,1.66,0,1,1,3.32,0C242.3,79.689,242.3,81.163,242.3,82.638Z"
                        transform="translate(0 -41.151)"
                      ></path>
                      <path
                        id="Path_471"
                        data-name="Path 471"
                        d="M344.821,39.477v-.284q0-2.811,0-5.622c0-.466.117-.584.575-.584h5.431c.424,0,.557.131.557.55q0,2.852,0,5.7v.236Zm3.2-4.033c.408,0,.817,0,1.225,0,.309,0,.5-.168.494-.418s-.191-.4-.487-.4q-1.211,0-2.423,0c-.3,0-.475.157-.477.4s.175.408.47.411C347.225,35.447,347.625,35.444,348.024,35.444Zm.029,1.638c.4,0,.8,0,1.2,0,.31,0,.5-.168.493-.42s-.192-.4-.488-.4q-1.212,0-2.423,0c-.3,0-.475.158-.476.406s.176.407.472.41C347.236,37.085,347.644,37.082,348.052,37.082Zm0,1.638c.4,0,.8,0,1.2,0,.309,0,.5-.169.492-.42s-.192-.395-.489-.4q-1.211,0-2.423,0c-.3,0-.474.158-.475.407s.176.406.473.409C347.236,38.724,347.645,38.721,348.053,38.721Z"
                        transform="translate(-100.065 0)"
                      ></path>
                    </g>
                  </svg>
                  <strong> Sabit Telefon :</strong>
                  <a href={`tel:${dealer.fixedPhone}`}>{dealer.fixedPhone}</a>
                </li>
                <li className="d-flex gap-2 align-items-center">
                  <svg
                    className="sherah-color1__fill"
                    xmlns="http://www.w3.org/2000/svg"
                    width="13.983"
                    height="13.981"
                    viewBox="0 0 13.983 13.981"
                  >
                    <path
                      id="Path_468"
                      data-name="Path 468"
                      d="M243.018,85.567c0,.4,0,.8,0,1.2a1.111,1.111,0,0,1-1.184,1.18,12.682,12.682,0,0,1-11.3-6.853,12.1,12.1,0,0,1-1.5-5.83,1.144,1.144,0,0,1,1.262-1.3q1.16,0,2.32,0a1.129,1.129,0,0,1,1.227,1.2,8.25,8.25,0,0,0,.362,2.282,1.287,1.287,0,0,1-.255,1.32c-.358.423-.668.886-1.009,1.323a.281.281,0,0,0-.028.36,8.757,8.757,0,0,0,3.635,3.627.263.263,0,0,0,.337-.029c.474-.368.958-.724,1.432-1.091a1.118,1.118,0,0,1,1.052-.211,9.653,9.653,0,0,0,2.55.406,1.1,1.1,0,0,1,1.094,1.131C243.026,84.712,243.018,85.139,243.018,85.567Z"
                      transform="translate(-229.038 -73.968)"
                    ></path>
                  </svg>
                  <strong> Mobil Telefon :</strong> :
                  <a href={`tel:${dealer.mobilePhone}`}>{dealer.mobilePhone}</a>
                </li>
                <li className="d-flex gap-2 align-items-center">
                  <svg
                    className="sherah-color1__fill"
                    xmlns="http://www.w3.org/2000/svg"
                    width="10.757"
                    height="14.39"
                    viewBox="0 0 10.757 14.39"
                  >
                    <path
                      id="Path_1021"
                      data-name="Path 1021"
                      d="M-348.264,473.154a5.264,5.264,0,0,1,5.147,6.731,14.587,14.587,0,0,1-2.221,4.257c-.77,1.062-1.616,2.073-2.443,3.1-.334.413-.615.4-.968,0a26.151,26.151,0,0,1-4.067-5.839,7.8,7.8,0,0,1-.8-2.588,5.171,5.171,0,0,1,3.35-5.249,6.189,6.189,0,0,1,.942-.271C-348.977,473.221-348.619,473.2-348.264,473.154Zm0,7.83a2.662,2.662,0,0,0,2.714-2.618,2.678,2.678,0,0,0-2.7-2.605,2.677,2.677,0,0,0-2.713,2.625A2.662,2.662,0,0,0-348.268,480.984Z"
                      transform="translate(353.642 -473.154)"
                    ></path>
                  </svg>
                  <strong> Adres :</strong>
                  <span>{dealer.address}</span>
                </li>
                <li className="d-flex gap-2 align-items-center">
                  <svg
                    className="sherah-color1__fill"
                    xmlns="http://www.w3.org/2000/svg"
                    width="13.98"
                    height="14.033"
                    viewBox="0 0 13.98 14.033"
                  >
                    <g
                      id="Group_131"
                      data-name="Group 131"
                      transform="translate(-219.859 -62.544)"
                    >
                      <path
                        id="Path_472"
                        data-name="Path 472"
                        d="M271.363,95.475h3.71c.626,0,.7.079.7.716,0,1.447,0,2.894,0,4.342a.459.459,0,0,1-.2.413c-.844.645-1.677,1.3-2.522,1.948a.71.71,0,0,1-.393.137q-1.291.018-2.583,0a.664.664,0,0,1-.371-.122q-1.289-.983-2.558-1.991a.523.523,0,0,1-.172-.359c-.012-1.493-.008-2.986-.007-4.479,0-.486.116-.6.594-.605Zm.637,5.474a3.893,3.893,0,0,0,.7.341,1.257,1.257,0,0,0,1.345-.694,2.636,2.636,0,0,0,.269-1.913,3.02,3.02,0,1,0-3.112,3.8c.349.016.57-.177.522-.467-.044-.264-.23-.339-.476-.359a2.2,2.2,0,0,1-1.7-3.381,2.155,2.155,0,0,1,2.948-.685.478.478,0,0,0-.623.271,1.437,1.437,0,0,0-1.921.8A2.33,2.33,0,0,0,269.8,99.7,1.44,1.44,0,0,0,272,100.949Z"
                        transform="translate(-44.527 -31.12)"
                      ></path>
                      <path
                        id="Path_473"
                        data-name="Path 473"
                        d="M243.053,251.784H230.261c.094-.08.151-.133.213-.181q2.254-1.754,4.512-3.5a.749.749,0,0,1,.418-.145c.86-.013,1.721-.01,2.582,0a.571.571,0,0,1,.325.1q2.348,1.812,4.686,3.636a.367.367,0,0,0,.1.038Z"
                        transform="translate(-9.83 -175.207)"
                      ></path>
                      <path
                        id="Path_474"
                        data-name="Path 474"
                        d="M219.859,174.433l4.671,3.633-4.671,3.633Z"
                        transform="translate(0 -105.737)"
                      ></path>
                      <path
                        id="Path_475"
                        data-name="Path 475"
                        d="M389.225,178.113l4.667-3.63v7.26Z"
                        transform="translate(-160.053 -105.784)"
                      ></path>
                      <path
                        id="Path_476"
                        data-name="Path 476"
                        d="M325.243,63.516h-2.686c.416-.344.766-.661,1.148-.931a.487.487,0,0,1,.446.032C324.512,62.877,324.843,63.18,325.243,63.516Z"
                        transform="translate(-97.051 0)"
                      ></path>
                      <path
                        id="Path_477"
                        data-name="Path 477"
                        d="M442.145,142.025v-2.23l1.378,1.157Z"
                        transform="translate(-210.063 -73.003)"
                      ></path>
                      <path
                        id="Path_478"
                        data-name="Path 478"
                        d="M228.2,139.874v2.218l-1.369-1.064Z"
                        transform="translate(-6.59 -73.078)"
                      ></path>
                      <path
                        id="Path_479"
                        data-name="Path 479"
                        d="M334.105,152.656a3.655,3.655,0,0,1-.262.637.469.469,0,0,1-.756.075,1.118,1.118,0,0,1-.1-1.389.55.55,0,0,1,.984.143A4.005,4.005,0,0,1,334.105,152.656Z"
                        transform="translate(-106.725 -84.286)"
                      ></path>
                      <path
                        id="Path_480"
                        data-name="Path 480"
                        d="M370.08,135.548a1.9,1.9,0,0,1,.681,2.51.7.7,0,0,1-.225.232c-.245.152-.407.061-.408-.227,0-.649.006-1.3,0-1.947C370.128,135.922,370.1,135.727,370.08,135.548Z"
                        transform="translate(-141.961 -68.99)"
                      ></path>
                    </g>
                  </svg>
                  <strong>Eposta :</strong>
                  <span>{dealer.email}</span>
                </li>
                <li className="d-flex gap-2 align-items-center">
                  <svg
                    className="sherah-color1__fill"
                    xmlns="http://www.w3.org/2000/svg"
                    width="13.98"
                    height="20.033"
                    viewBox="0 0 14 14"
                    role="img"
                    aria-label="Status"
                  >
                    <path d="M7 1c1.7 1.1 3.3 1.6 4.8 1.9v3.9c0 2.8-2.2 4.8-4.8 5.9C4.4 11.6 2.2 9.6 2.2 6.8V2.9C3.7 2.6 5.3 2.1 7 1Z"></path>

                    <path d="M6.1 9.2 4.7 7.8a.7.7 0 1 0-1 1l1.9 1.9a.7.7 0 0 0 1 0l3.4-3.4a.7.7 0 1 0-1-1L6.1 9.2Z"></path>
                  </svg>
                  <strong> Durum :</strong>
                  <span>{dealer.status}</span>
                </li>
                <li className="d-flex gap-2 align-items-center">
                  <svg
                    className="sherah-color1__fill"
                    xmlns="http://www.w3.org/2000/svg"
                    width="13.98"
                    height="14.033"
                    viewBox="0 0 14 14"
                    role="img"
                    aria-label="Currency"
                  >
                    <path d="M7 1.5c-3 0-5 1-5 2.1S4 5.7 7 5.7s5-1 5-2.1-2-2.1-5-2.1Z"></path>
                    <path d="M2 5.7v2c0 1.1 2 2.1 5 2.1s5-1 5-2.1v-2c-1 1.1-3 1.7-5 1.7s-4-.6-5-1.7Z"></path>
                    <path d="M2 8.8v2c0 1.1 2 2.1 5 2.1s5-1 5-2.1v-2c-1 1.1-3 1.7-5 1.7s-4-.6-5-1.7Z"></path>
                  </svg>
                  <strong> Para Birimi :</strong>
                  <span>{dealer.preferredCurrency}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* <table className="table table-striped table-bordered mb-5">
        <tbody>
          <tr>
            <th>Telefon (Sabit)</th>
            <td>{dealer.fixedPhone ?? "-"}</td>
          </tr>
          <tr>
            <th>Telefon (Mobil)</th>
            <td>{dealer.mobilePhone ?? "-"}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{dealer.email ?? "-"}</td>
          </tr>
          <tr>
            <th>Adres</th>
            <td>{dealer.address ?? "-"}</td>
          </tr>
          <tr>
            <th>Durum</th>
            <td>{dealer.status ?? "-"}</td>
          </tr>
          <tr>
            <th>Para Birimi</th>
            <td>{dealer.preferredCurrency ?? "-"}</td>
          </tr>
        </tbody>
      </table> */}

      {/* Kullanıcılar Tablosu */}
      <div
        className="sherah-contact-card sherah-default-bg mb-1 pb-2 mt-5"
        style={{ minHeight: 30 }}
      >
        <h3 className="sherah-contact-card__title">Bayi Kullanıcıları</h3>
      </div>

      {dealer.users && dealer.users.length > 0 ? (
        <div className="sherah-table p-0">
          <table className="sherah-table__main sherah-table__main-v3">
            <thead className="sherah-table__head">
              <tr>
                <th>Ad Soyad</th>
                <th>Email</th>
                <th className="text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody className="sherah-table__body">
              {dealer.users.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName ?? `${u.firstName} ${u.lastName}`}</td>
                  <td>{u.email}</td>
                  <td>
                    <div className="sherah-table__status__group justify-content-center">
                      <button
                        className="sherah-table__action sherah-color3 sherah-color3__bg--opactity border-0"
                        onClick={() => setEditUser(u)}
                      >
                        <i className="fa-regular fa-pen-to-square" />
                      </button>
                      <button
                        className="sherah-table__action sherah-color2 sherah-color2__bg--offset border-0"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        <i className="fa-regular fa-trash-can" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-info">
          Bu bayiye ait kullanıcı bulunamadı.
        </div>
      )}

      {/* Güncelleme Modalı */}
      {editUser && (
        <EditDealerUserModal
          target={editUser}
          onClose={() => setEditUser(null)}
          onSaved={(updated) => {
            setDealer((prev) =>
              prev
                ? {
                    ...prev,
                    users: prev.users?.map((u) =>
                      u.id === updated.id ? updated : u
                    ),
                  }
                : prev
            );
            setEditUser(null);
          }}
        />
      )}
    </div>
  );
}

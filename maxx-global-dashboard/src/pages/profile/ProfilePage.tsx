import { useEffect, useMemo, useState } from "react";
import { getMyProfile, type UserProfile } from "../../services/--userService";

export default function ProfilePage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // izinleri tekille
  // const allPermissions = useMemo(() => {
  //   const s = new Set<string>();
  //   me?.roles?.forEach((r) => r.permissions?.forEach((p) => s.add(p.name)));
  //   return Array.from(s).sort();
  // }, [me]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const p = await getMyProfile();
        setMe(p);
      } catch (e) {
        setError("Profil bilgileri alınamadı.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fullName = useMemo(
    () => [me?.firstName, me?.lastName].filter(Boolean).join(" "),
    [me]
  );

  const rolesText = useMemo(
    () => (me?.roles?.length ? me.roles.map((r) => r.name).join(", ") : "-"),
    [me]
  );

  if (loading)
    return (
      <div className="m-3">
        {" "}
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Yükleniyor</span>
          </div>
        </div>
      </div>
    );
  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!me) return null;

  return (
    <div className="sherah-personals">
      <div className="row">
        {/* SOL MENÜ */}

        {/* SAĞ İÇERİK */}
        <div className="col-lg-12 col-md-10 col-12  sherah-personals__content mg-top-30">
          <div className="sherah-ptabs">
            <div className="sherah-ptabs__inner">
              <div className="tab-content" id="nav-tabContent">
                {/* TAB #1 – PERSONAL INFO (DİNAMİK) */}
                <div
                  className="tab-pane fade show active"
                  id="id1"
                  role="tabpanel"
                >
                  <form action="#">
                    <div className="row">
                      <div className="col-12">
                        <div className="sherah-ptabs__separate">
                          <div className="sherah-ptabs__form-main">
                            <div className="sherah__item-group sherah-default-bg sherah-border">
                              {/* Profile Cover Info */}
                              <div className="sherah-profile-cover sherah-offset-bg sherah-dflex">
                                <div className="sherah-profile-cover__img">
                                  <img
                                    src={
                                      me.avatarUrl ||
                                      "../../src/assets/img/user-default.png"
                                    }
                                    alt={fullName || "User"}
                                  />
                                </div>
                                <div className="sherah-profile-cover__content">
                                  <h3 className="sherah-profile-cover__title">
                                    {fullName || "-"}
                                  </h3>
                                </div>
                              </div>
                              {/* Personal Information */}
                              <div className="sherah-profile-info__v2 mg-top-30">
                                <h3 className="sherah-profile-info__heading mg-btm-30">
                                  Kişi Bilgileri
                                </h3>
                                <ul className="sherah-profile-info__list sherah-dflex-column">
                                  <li className="sherah-dflex">
                                    <h4 className="sherah-profile-info__title">
                                      Adı Soyadı :
                                    </h4>
                                    <p className="sherah-profile-info__text">
                                      {fullName || "-"}
                                    </p>
                                  </li>
                                  <li className="sherah-dflex">
                                    <h4 className="sherah-profile-info__title">
                                      Eposta :
                                    </h4>
                                    <p className="sherah-profile-info__text">
                                      {me.email}
                                    </p>
                                  </li>
                                  <li className="sherah-dflex">
                                    <h4 className="sherah-profile-info__title">
                                      Telefon :
                                    </h4>
                                    <p className="sherah-profile-info__text">
                                      {me.phoneNumber || "-"}
                                    </p>
                                  </li>
                                  <li className="sherah-dflex">
                                    <h4 className="sherah-profile-info__title">
                                      Rol :
                                    </h4>
                                    <p className="sherah-profile-info__text">
                                      {rolesText}
                                    </p>
                                  </li>
                                  <li className="sherah-dflex">
                                    <h4 className="sherah-profile-info__title">
                                      Adres :
                                    </h4>
                                    <p className="sherah-profile-info__text">
                                      {me.address || "-"}
                                    </p>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* TAB #2…#6 – orijinal HTML’i olduğu gibi bırakıyorum (statik) */}
                <div className="tab-pane fade" id="id2" role="tabpanel">
                  {/* Payment Method içeriğin – verdiğin HTML’i JSX’e çevirip yapıştırabilirsin */}
                </div>
                <div className="tab-pane fade" id="id3" role="tabpanel">
                  {/* Notification Setting */}
                </div>
                <div className="tab-pane fade" id="id4" role="tabpanel">
                  {/* Login Activity */}
                </div>
                <div className="tab-pane fade" id="id5" role="tabpanel">
                  {/* Change Password – form alanlarında id’leri benzersiz yapmanı öneririm */}
                </div>
                <div className="tab-pane fade" id="id6" role="tabpanel">
                  {/* Social Connect */}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /SAĞ İÇERİK */}
      </div>
    </div>
  );
}

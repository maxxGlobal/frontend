import { useEffect, useState } from "react";
import Layout from "../Partials/Layout";
import { getDealerById } from "../../../services/dealers/getById";
import type { DealerRow } from "../../../types/dealer";
import addressIcon from "../../../assets/img/address.svg";
import emailIcon from "../../../assets/img/email-contact.svg";
import phoneIcon from "../../../assets/img/phone.svg";
import { Helmet } from "react-helmet-async";
import "../../../theme.css";
import "../../../assets/homepage.css";

function getDealerIdFromLocal(): number | null {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user?.dealer?.id ?? null;
  } catch {
    return null;
  }
}

export default function Contact() {
  const [dealer, setDealer] = useState<DealerRow | null>(null);

  useEffect(() => {
    const dealerId = getDealerIdFromLocal();
    if (!dealerId) return;

    getDealerById(dealerId)
      .then((res) => setDealer(res))
      .catch((err) => console.error("Dealer fetch error", err));
  }, []);
  const mapUrl = dealer?.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        "Ehlibeyt Mah. Tekstilciler Cd. 35 / 7 Çankaya, Ankara – Türkiye"
      )}&output=embed`
    : "";

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <Helmet>
        <title>Medintera – İletişim</title>
        <meta name="description" content="İletişim" />
      </Helmet>
      <div className="page-title mb-10"></div>
      <div className="contact-wrapper w-full mb-10">
        <div className="container-x mx-auto">
          <div className="main-wrapper w-full lg:flex lg:space-x-[30px]">
            <div className="w-full">
              <h1 className="text-[22px] font-semibold text-qblack leading-[30px] mb-1">
                İletişim Bilgileri
              </h1>
              <p className="text-[15px] text-qgraytwo leading-[30px] mb-5">
                Bize Aşağıdaki Bilgilerden Ulaşabilrsiniz
              </p>

              {/* Phone & Email */}
              <div className="xl:flex xl:space-x-[30px] mb-[30px]">
                <div className="xl:w-1/2 w-full h-[196px] flex flex-col justify-center bg-[#FFEAE5] p-5">
                  <div className="flex justify-center mb-3">
                    <img src={phoneIcon} alt={dealer?.name} />
                  </div>
                  <p className="text-[22px] text-black text-center font-semibold">
                    Telefon
                  </p>
                  <p className="text-[15px] text-black text-center">
                    <a href="tel:+90 507 916 42 73">+90 507 916 42 73</a>
                  </p>
                </div>

                <div className="xl:w-1/2 w-full h-[196px] flex flex-col justify-center bg-[#D3EFFF] p-5">
                  <div className="flex justify-center mb-3">
                    <img src={emailIcon} alt={dealer?.name} />
                  </div>
                  <p className="text-[22px] text-black text-center font-semibold">
                    Eposta
                  </p>
                  <p className="text-[15px] text-black text-center">
                    <a href="mailto:bilgi@medintera.com.tr">
                      bilgi@medintera.com.tr
                    </a>
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="p-5 flex flex-col justify-between w-full bg-[#E7F2EC]">
                <div className="flex justify-center mb-3">
                  <img src={addressIcon} alt={dealer?.name} />
                </div>
                <div className="flex justify-center space-x-5">
                  <div>
                    <p className="text-[22px] text-black text-center font-semibold">
                      Adres
                    </p>
                    <p className="text-[15px] text-black text-center">
                      MEDİNTERA MİMARLIK TASARIM MEDİKAL SAN. VE TİC. LTD. ŞTİ.
                      Ehlibeyt Mah. Tekstilciler Cd. 35 / 7 Çankaya, Ankara –
                      Türkiye
                    </p>
                  </div>
                </div>
                <div className="w-full h-[206px] mt-5">
                  {dealer?.address && (
                    <iframe
                      title="dealer-map"
                      src={mapUrl}
                      style={{ border: 0, width: "100%", height: "100%" }}
                      loading="lazy"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Contact Form */}
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "../Partials/Layout";
import { getDealerById } from "../../../services/dealers/getById";
import type { DealerRow } from "../../../types/dealer";
const addressIcon = "/assets/img/address.svg";
const emailIcon = "/assets/img/email-contact.svg";
const phoneIcon = "/assets/img/phone.svg";
import { Helmet } from "react-helmet-async";
import "../../../theme.css";
import "../../../../public/assets/homepage.css";

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
  const { t } = useTranslation();
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
        t("pages.contact.mapAddress")
      )}&output=embed`
    : "";

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <Helmet>
        <title>{t("pages.contact.metaTitle")}</title>
        <meta name="description" content={t("pages.contact.metaDescription")} />
      </Helmet>
      <div className="page-title mb-10"></div>
      <div className="contact-wrapper w-full mb-10">
        <div className="container-x mx-auto">
          <div className="main-wrapper w-full lg:flex lg:space-x-[30px]">
            <div className="w-full">
              <h1 className="text-[22px] font-semibold text-qblack leading-[30px] mb-1">
                {t("pages.contact.pageTitle")}
              </h1>
              <p className="text-[15px] text-qgraytwo leading-[30px] mb-5">
                {t("pages.contact.subtitle")}
              </p>

              {/* Phone & Email */}
              <div className="xl:flex xl:space-x-[30px] mb-[30px]">
                <div className="xl:w-1/2 w-full h-[196px] flex flex-col justify-center bg-[#FFEAE5] p-5">
                  <div className="flex justify-center mb-3">
                    <img src={phoneIcon} alt={t("pages.contact.phoneAlt") || dealer?.name} />
                  </div>
                  <p className="text-[22px] text-black text-center font-semibold">
                    {t("pages.contact.phoneTitle")}
                  </p>
                  <p className="text-[15px] text-black text-center">
                    <a href={`tel:${t("pages.contact.phoneHref")}`}>
                      {t("pages.contact.phoneNumber")}
                    </a>
                  </p>
                </div>

                <div className="xl:w-1/2 w-full h-[196px] flex flex-col justify-center bg-[#D3EFFF] p-5">
                  <div className="flex justify-center mb-3">
                    <img src={emailIcon} alt={t("pages.contact.emailAlt") || dealer?.name} />
                  </div>
                  <p className="text-[22px] text-black text-center font-semibold">
                    {t("pages.contact.emailTitle")}
                  </p>
                  <p className="text-[15px] text-black text-center">
                    <a href={`mailto:${t("pages.contact.emailAddress")}`}>
                      {t("pages.contact.emailAddress")}
                    </a>
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="p-5 flex flex-col justify-between w-full bg-[#E7F2EC]">
                <div className="flex justify-center mb-3">
                  <img src={addressIcon} alt={t("pages.contact.addressAlt") || dealer?.name} />
                </div>
                <div className="flex justify-center space-x-5">
                  <div>
                    <p className="text-[22px] text-black text-center font-semibold">
                      {t("pages.contact.addressTitle")}
                    </p>
                    <p className="text-[15px] text-black text-center">
                      {t("pages.contact.companyName")}
                      <br />
                      {t("pages.contact.addressLine1")}
                      <br />
                      {t("pages.contact.addressLine2")}
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

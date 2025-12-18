import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; 
const Logo = "/assets/img/medintera-logo.png";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer-section-wrapper bg-white">
      <div className="container-x block mx-auto pt-[30px]">
        <div className="lg:flex justify-between mb-[85px]">
          <div className="lg:w-4/10 w-full mb-10 lg:mb-0">
            {/* logo area */}
            <div className="mb-5">
              <Link to="/homepage">
                <img
                  width="260"
                  height="20"
                  src={Logo}
                  alt={t("footer.logoAlt")}
                />
              </Link>
            </div>
            <div>
              <p className="text-[#9A9A9A] text-[15px] w-[300px] leading-[28px]">
                {t("footer.description")}
              </p>
            </div>
          </div>
          <div className="lg:flex gap-30 lg:mt-6">
            <div className="lg:w-2/10 w-full mb-10 lg:mb-0">
              <div className="mb-5">
                <h6 className="text-[18] font-500 text-[#2F2F2F]">
                  {t("footer.aboutTitle")}
                </h6>
              </div>
              <div>
                <ul className="flex flex-col space-y-5 ">
                  <li>
                    <Link to="/homepage/about">
                      <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack">
                        {t("footer.aboutLink")}
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            {/* <div className="lg:w-2/10 w-full mb-10 lg:mb-0 ">
            <div className="mb-5">
              <h6 className="text-[18] font-500 text-[#2F2F2F]">Kurumsal</h6>
            </div>
            <div>
              <ul className="flex flex-col space-y-5 ">
                <li>
                  <Link to="/homepage/kvkk">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack">
                      KVKK
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/homepage/quality-policy">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack">
                      Kalite Politikamız
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div> */}
            <div className="lg:w-2/10 w-full mb-10 lg:mb-0">
              <div className="mb-5">
                <h6 className="text-[18] font-500 text-[#2F2F2F]">
                  {t("footer.productsTitle")}
                </h6>
              </div>
              <div>
                <ul className="flex flex-col space-y-5 ">
                  <li>
                    <Link to="/homepage/all-product">
                      <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack">
                        {t("footer.productsLink")}
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="lg:w-2/10 w-full mb-10 lg:mb-0">
              <div className="mb-5">
                <h6 className="text-[18] font-500 text-[#2F2F2F]">
                  {t("footer.contactTitle")}
                </h6>
              </div>
              <div>
                <ul className="flex flex-col space-y-5 ">
                  <li>
                    <Link to="/homepage/contact">
                      <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack">
                        {t("footer.contactLink")}
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div> 
      </div>
    </footer>
  );
}

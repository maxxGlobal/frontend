import { Link } from "react-router-dom";
import PageTitle from "../Helpers/PageTitle";
import type { Crumb } from "../Helpers/PageTitle";
import Layout from "../Partials/Layout";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
const AboutImage = "/assets/img/about.png";
import "../../../theme.css";
import "../../../../public/assets/homepage.css";
 

export default function About() {
  const { t } = useTranslation();
  const crumbs: Crumb[] = [
    { name: "home", path: "/homepage" },
    { name: t("pages.about.title"), path: "/homepage/about" },
  ]; 

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <Helmet>
        <title>{t("pages.about.metaTitle")}</title>
        <meta name="description" content={t("pages.about.metaDescription") ?? ""} />
      </Helmet>
      <div className="about-page-wrapper w-full">
        <div className="title-area w-full">
          <PageTitle title={t("pages.about.title") ?? ""} breadcrumb={crumbs} />
        </div>
        <div className="aboutus-wrapper w-full">
          <div className="container-x mx-auto">
            <div className="w-full min-h-[665px] lg:flex lg:space-x-12 items-center pb-10 lg:pb-0">
              <div className="md:w-[570px] w-full md:h-max h-auto rounded overflow-hidden my-5 lg:my-0">
                <img src={AboutImage} alt="about" className="w-full h" />
              </div>
              <div className="content flex-1">
                <p className="text-[15px] text-qgraytwo leading-7 mb-2.5">
                  {t("pages.about.body")}
                </p>
                <Link to="/homepage/contact">
                  <div className="w-auto h-10">
                    <span className="yellow-btn">{t("pages.about.contactCta")}</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

         
      </div>
    </Layout>
  );
}

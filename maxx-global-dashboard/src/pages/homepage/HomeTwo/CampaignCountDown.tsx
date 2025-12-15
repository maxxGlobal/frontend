import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type CampaignCountDownProps = {
  className?: string;
  lastDate: string | Date;
};

export default function CampaignCountDown({
  className,
}: CampaignCountDownProps) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={`w-full lg:h-[560px] ${className || ""}`}>
        <div className="container-x mx-auto h-full">
          <div className="items-center h-full banner-discount">
            <div
              data-aos="fade-right"
              className="campaign-countdown h-full w-full mb-5 lg:mb-0 rounded-xl"
              style={{
                background: `url(src/assets/images/discount-banner-new.png) no-repeat`,
                backgroundSize: "cover",
              }}
            >
              <Link to="/homepage/flash-sale">
                <div className="w-full xl:p-12 p-5 flex h-full items-center">
                  {/* title */}
                  <div className="countdown-title mb-4 ">
                    <h1 className="lg:text-[54px] text-[38px] text-qyellow font-600">
                      {t("pages.homeTwo.countdown.title")}
                    </h1>
                    <p className="text-[18px] text-qblack leading-7">
                      {t("pages.homeTwo.countdown.subtitleLine1")}
                      <br /> {t("pages.homeTwo.countdown.subtitleLine2")}
                    </p>
                    <div className="w-max mt-4">
                      <div className="bg-qyellow banner-discount-btn flex group  space-x-2 items-center border border-qyellow px-4 py-2 rounded-xl transition hover:text-white hover:bg-qh2-green">
                        <span className="text-sm font-600 tracking-wide leading-7 ">
                          {t("pages.homeTwo.countdown.cta")}
                        </span>
                        <span>
                          <svg
                            width="7"
                            height="11"
                            viewBox="0 0 7 11"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="group-hover"
                          >
                            <rect
                              x="2.08984"
                              y="0.636719"
                              width="6.94219"
                              height="1.54271"
                              transform="rotate(45 2.08984 0.636719)"
                              fill="#1D1D1D"
                            />
                            <rect
                              x="7"
                              y="5.54492"
                              width="6.94219"
                              height="1.54271"
                              transform="rotate(135 7 5.54492)"
                              fill="#1D1D1D"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* button */}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

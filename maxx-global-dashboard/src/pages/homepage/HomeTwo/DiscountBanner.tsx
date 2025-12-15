import { useTranslation } from "react-i18next";

type DiscountBannerProps = {
  className?: string;
};

export default function DiscountBanner({ className }: DiscountBannerProps) {
  const { t } = useTranslation();
  return (
    <div
      className={`discount-banner w-full h-[307px] bg-cover flex justify-center items-center bg-qh2-green ${
        className ?? ""
      }`}
    >
      <div className="text-qblack">
        <div data-aos="fade-up">
          <h1 className="sm:text-3xl text-xl font-700 text-white text-qblack mb-2 text-center">
            <span className="mx-1 text-qyellow">{t("pages.homeTwo.discountBanner.highlight")}</span>{" "}
            {t("pages.homeTwo.discountBanner.title")}
          </h1>
          <p className="text-center sm:text-[18px] text-sm text-qblack font-400">
            {t("pages.homeTwo.discountBanner.subtitle")}
          </p>
        </div>

        <div
          data-aos="fade-right"
          className="h-[54px] flex mt-8 justify-center"
        >
          <a
            href="/homepage/flash-sale"
            type="button"
            className="px-6 h-full flex justify-center items-center bg-qyellow text-md font-600 rounded"
          >
            {t("pages.homeTwo.discountBanner.cta")}
          </a>
        </div>
      </div>
    </div>
  );
}

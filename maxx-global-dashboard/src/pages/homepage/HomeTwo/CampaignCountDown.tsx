import { Link } from "react-router-dom";
import useCountDown from "../Helpers/CountDown";

type CampaignCountDownProps = {
  className?: string;
  lastDate: string;
};

export default function CampaignCountDown({
  className,
  lastDate,
}: CampaignCountDownProps) {
  const { showDate, showHour, showMinute, showSecound } =
    useCountDown(lastDate);

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
                <div className="w-full xl:p-12 p-5">
                  {/* countdown */}
                  <div className="countdown-wrapper w-full flex space-x-[23px] lg:mb-10 mb-1">
                    <div className="countdown-item">
                      <div className="countdown-number sm:w-[100px] sm:h-[100px] w-[50px] h-[50px] rounded-full bg-white flex justify-center items-center">
                        <span className="font-700 sm:text-[30px] text-[14px] text-[#EB5757]">
                          {showDate}
                        </span>
                      </div>
                      <p className="sm:text-[18px] text-[12px] font-500 text-center leading-8">
                        Gün
                      </p>
                    </div>
                    <div className="countdown-item">
                      <div className="countdown-number sm:w-[100px] sm:h-[100px] w-[50px] h-[50px] rounded-full bg-white flex justify-center items-center">
                        <span className="font-700 sm:text-[30px] text-[14px] text-[#2F80ED]">
                          {showHour}
                        </span>
                      </div>
                      <p className="sm:text-[18px] text-[12px] font-500 text-center leading-8">
                        Saat
                      </p>
                    </div>
                    <div className="countdown-item">
                      <div className="countdown-number sm:w-[100px] sm:h-[100px] w-[50px] h-[50px] rounded-full bg-white flex justify-center items-center">
                        <span className="font-700 sm:text-[30px] text-[14px] text-[#219653]">
                          {showMinute}
                        </span>
                      </div>
                      <p className="sm:text-[18px] text-[12px] font-500 text-center leading-8">
                        Dakika
                      </p>
                    </div>
                    <div className="countdown-item">
                      <div className="countdown-number sm:w-[100px] sm:h-[100px] w-[50px] h-[50px] rounded-full bg-white flex justify-center items-center">
                        <span className="font-700 sm:text-[30px] text-[14px] text-[#EF5DA8]">
                          {showSecound}
                        </span>
                      </div>
                      <p className="sm:text-[18px] text-[12px] font-500 text-center leading-8">
                        Saniye
                      </p>
                    </div>
                  </div>

                  {/* title */}
                  <div className="countdown-title mb-4">
                    <h1 className="lg:text-[54px] text-[38px] text-qyellow font-600">
                      İndirimli Ürünler
                    </h1>
                    <p className="text-[18px] text-qblack leading-7">
                      İndirimdeki Ürünlere Göz Atın
                      <br /> Fırsatları Kaçırmayın
                    </p>
                  </div>

                  {/* button */}
                  <div className="w-max">
                    <div className="bg-qyellow banner-discount-btn flex group  space-x-2 items-center border border-qyellow px-4 py-2 rounded-xl transition hover:text-white hover:bg-qh2-green">
                      <span className="text-sm font-600 tracking-wide leading-7 ">
                        Alışveriş Yap
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
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

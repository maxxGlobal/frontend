import { useRef } from "react";
import { Link } from "react-router-dom";
import PageTitle from "../Helpers/PageTitle";
import type { Crumb } from "../Helpers/PageTitle";
import Layout from "../Partials/Layout";
import AboutImage from "../../../assets/img/about.png";
import "../../../theme.css";
import "../../../assets/homepage.css";

const crumbs: Crumb[] = [
  { name: "home", path: "/homepage" },
  { name: "Hakkımızda", path: "/homepage/about" },
];
export default function About() {
  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="about-page-wrapper w-full">
        <div className="title-area w-full">
          <PageTitle title="Hakkımızda" breadcrumb={crumbs} />
        </div>
        <div className="aboutus-wrapper w-full">
          <div className="container-x mx-auto">
            <div className="w-full min-h-[665px] lg:flex lg:space-x-12 items-center pb-10 lg:pb-0">
              <div className="md:w-[570px] w-full md:h-max h-auto rounded overflow-hidden my-5 lg:my-0">
                <img src={AboutImage} alt="about" className="w-full h" />
              </div>
              <div className="content flex-1">
                <p className="text-[15px] text-qgraytwo leading-7 mb-2.5">
                  Özellikle kırık tedavilerindeki gelişmeler çok sayıda ürünün
                  üretilmesini ve hekimlerin kullanımına arz edilmesini
                  sağlamıştır. Sağlık hizmetlerinde teknolojik cihazların
                  kullanımı cerrahi işlem ve tedavi sürelerini kısaltmakta,
                  tedavilerin başarı oranlarını artırmakta ve toplam hasta
                  memnuniyetini giderek artırmaktadır. Tıbbi cihazların ve
                  ortopedik implantların kullanıma uygun bir şekilde
                  üretilmeleri, kalite unsurlarının incelenmesi ve biyolojik
                  uygunluklarının bulunması gibi aşamaları bulunmaktadır.
                  Üretilen cihazların CE ve FDA gibi kalite değerlendirme
                  kuruluşları tarafından denetlenerek insan sağlığı yönünden
                  etkin ve güvenilir olduğunun belgelenmiş olması gerekir. Gerek
                  Türkiye gerekse global tıbbi cihaz pazarına firmamız
                  tarafından sunulan tüm ürünler en yüksek kalite standartları
                  ve güvenlik gerekliliklerini taşımaktadır. Eksternal Fiksatör
                  Sistemleri firmamızın uzmanlık alanıdır. Bunlarla hasta
                  memnuniyetini en üst seviyeye çıkarmayı hedeflemekteyiz.
                </p>
                <Link to="/homepage/contact">
                  <div className="w-auto h-10">
                    <span className="yellow-btn">İletişime Geçin</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container-x mx-auto my-[60px]">
          <div
            data-aos="fade-down"
            className="best-services w-full bg-qyellow flex flex-col space-y-10 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center lg:h-[200px] px-10 lg:py-0 py-12 lg:gap-[50px]"
          >
            <div className="item">
              <div className="space-x-5 items-center">
                <div className="flex justify-center mb-3">
                  <span>
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 36 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1H5.63636V24.1818H35"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="square"
                      />
                      <path
                        d="M8.72763 35.0002C10.4347 35.0002 11.8185 33.6163 11.8185 31.9093C11.8185 30.2022 10.4347 28.8184 8.72763 28.8184C7.02057 28.8184 5.63672 30.2022 5.63672 31.9093C5.63672 33.6163 7.02057 35.0002 8.72763 35.0002Z"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="square"
                      />
                      <path
                        d="M31.9073 35.0002C33.6144 35.0002 34.9982 33.6163 34.9982 31.9093C34.9982 30.2022 33.6144 28.8184 31.9073 28.8184C30.2003 28.8184 28.8164 30.2022 28.8164 31.9093C28.8164 33.6163 30.2003 35.0002 31.9073 35.0002Z"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="square"
                      />
                      <path
                        d="M34.9982 1H11.8164V18H34.9982V1Z"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="square"
                      />
                      <path
                        d="M11.8164 7.18164H34.9982"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="square"
                      />
                    </svg>
                  </span>
                </div>
                <div className="text-center mb-3">
                  <p className="text-black text-[15px] font-700 tracking-wide mb-1 uppercase">
                    Hassas Mühendislik
                  </p>
                  <p className="text-sm text-qblack text-wrap">
                    Gelişmiş CNC teknolojisiyle yüksek hassasiyetli parçalar
                    üretimi.
                  </p>
                </div>
              </div>
            </div>
            <div className="item">
              <div className="space-x-5 items-center">
                <div className="flex justify-center mb-3">
                  <span>
                    <svg
                      width="32"
                      height="34"
                      viewBox="0 0 32 34"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M31 17.4502C31 25.7002 24.25 32.4502 16 32.4502C7.75 32.4502 1 25.7002 1 17.4502C1 9.2002 7.75 2.4502 16 2.4502C21.85 2.4502 26.95 5.7502 29.35 10.7002"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                      />
                      <path
                        d="M30.7 2L29.5 10.85L20.5 9.65"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="square"
                      />
                    </svg>
                  </span>
                </div>
                <div className="text-center mb-3">
                  <p className="text-black text-[15px] font-700 tracking-wide mb-1 uppercase">
                    Kapsamlı Hizmetler
                  </p>
                  <p className="text-sm text-qblack text-wrap">
                    Kaplama, taşlama, montaj ve markalama gibi geniş yelpazede
                    ek hizmetler.
                  </p>
                </div>
              </div>
            </div>
            <div className="item">
              <div className="space-x-5 items-center">
                <div className="flex justify-center mb-3">
                  <span>
                    <svg
                      width="32"
                      height="38"
                      viewBox="0 0 32 38"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.6654 18.667H9.33203V27.0003H22.6654V18.667Z"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="square"
                      />
                      <path
                        d="M12.668 18.6663V13.6663C12.668 11.833 14.168 10.333 16.0013 10.333C17.8346 10.333 19.3346 11.833 19.3346 13.6663V18.6663"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="square"
                      />
                      <path
                        d="M31 22C31 30.3333 24.3333 37 16 37C7.66667 37 1 30.3333 1 22V5.33333L16 2L31 5.33333V22Z"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="square"
                      />
                    </svg>
                  </span>
                </div>
                <div className="text-center mb-3">
                  <p className="text-black text-[15px] font-700 tracking-wide mb-1 uppercase">
                    Yenilikçi üretim
                  </p>
                  <p className="text-sm text-qblack text-wrap">
                    En son teknolojilerle, sektörlerde öncü çözümler sunma.
                  </p>
                </div>
              </div>
            </div>
            <div className="item">
              <div className="space-x-5 items-center">
                <div className="flex justify-center mb-3">
                  <span>
                    <svg
                      width="32"
                      height="35"
                      viewBox="0 0 32 35"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 13H5.5C2.95 13 1 11.05 1 8.5V1H7"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                      />
                      <path
                        d="M25 13H26.5C29.05 13 31 11.05 31 8.5V1H25"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                      />
                      <path
                        d="M16 28V22"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                      />
                      <path
                        d="M16 22C11.05 22 7 17.95 7 13V1H25V13C25 17.95 20.95 22 16 22Z"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="square"
                      />
                      <path
                        d="M25 34H7C7 30.7 9.7 28 13 28H19C22.3 28 25 30.7 25 34Z"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="square"
                      />
                    </svg>
                  </span>
                </div>
                <div className="text-center mb-3">
                  <p className="text-black text-[15px] font-700 tracking-wide mb-1 uppercase">
                    Güvenilirlik
                  </p>
                  <p className="text-sm text-qblack text-wrap">
                    Her projede zamanında ve eksikssiz teslimat ile müşteri
                    memnuniyetini sağlama.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

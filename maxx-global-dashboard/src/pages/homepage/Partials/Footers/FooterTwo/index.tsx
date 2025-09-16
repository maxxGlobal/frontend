import { Link } from "react-router-dom";
import Facebook from "../../../Helpers/icons/Facebook";
import Instagram from "../../../Helpers/icons/Instagram";
import Youtube from "../../../Helpers/icons/Youtube";
import Logo from "../../../../../assets/img/medintera-logo.png";

export default function Footer() {
  return (
    <footer className="footer-section-wrapper bg-white">
      <div className="container-x block mx-auto pt-[83px]">
        <div className="lg:flex justify-between mb-[85px]">
          <div className="lg:w-4/10 w-full mb-10 lg:mb-0">
            {/* logo area */}
            <div className="mb-5">
              <Link to="/">
                <img width="260" height="36" src={Logo} alt="logo" />
              </Link>
            </div>
            <div>
              <p className="text-[#9A9A9A] text-[15px] w-[300px] leading-[28px]">
                Medintera olarak, savunma ve medikal sektörlerinde en yenilikçi
                ve güvenilir üretim ortağı olmayı, teknolojiyi en üst düzeyde
                kullanarak global ölçekte tanınan bir marka haline gelmeyi
                hedefliyoruz.
              </p>
            </div>
          </div>
          <div className="lg:w-2/10 w-full mb-10 lg:mb-0">
            <div className="mb-5">
              <h6 className="text-[18] font-500 text-[#2F2F2F]">Hakkımızda</h6>
            </div>
            <div>
              <ul className="flex flex-col space-y-5 ">
                <li>
                  <Link to="/">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack">
                      Vizyonumuz
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack">
                      Misyonumuz
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="lg:w-2/10 w-full mb-10 lg:mb-0 ">
            <div className="mb-5">
              <h6 className="text-[18] font-500 text-[#2F2F2F]">Kurumsal</h6>
            </div>
            <div>
              <ul className="flex flex-col space-y-5 ">
                <li>
                  <Link to="/">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack">
                      KVKK
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack">
                      Kalite Politikamız
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="lg:w-2/10 w-full mb-10 lg:mb-0">
            <div className="mb-5">
              <h6 className="text-[18] font-500 text-[#2F2F2F]">Ürünler</h6>
            </div>
            <div>
              <ul className="flex flex-col space-y-5 ">
                <li>
                  <Link to="/homepage/all-product">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack">
                      Ürünlerimiz
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bottom-bar border-t border-qgray-border lg:h-[82px] lg:flex justify-between items-center">
          <div className="flex lg:space-x-5 justify-between items-center mb-3 w-full">
            <div className="flex space-x-5 items-center">
              <a href="#">
                <Instagram className="fill-current text-qgray hover:text-qblack" />
              </a>
              <a href="#">
                <Facebook className="fill-current text-qgray hover:text-qblack" />
              </a>
              <a href="#">
                <Youtube className="fill-current text-qgray hover:text-qblack" />
              </a>
            </div>
            <div className="blok sm:text-base text-[10px] text-qgray font-300">
              ©{new Date().getFullYear()}
              <a
                href="https://quomodosoft.com/"
                target="_blank"
                rel="noreferrer"
                className="font-500 text-qblack mx-1"
              >
                Medintera
              </a>
              Her hakkı saklıdır
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

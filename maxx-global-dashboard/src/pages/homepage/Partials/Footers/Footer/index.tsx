import { Link } from "react-router-dom";
import Facebook from "../../../Helpers/icons/Facebook";
import Instagram from "../../../Helpers/icons/Instagram";
import Youtube from "../../../Helpers/icons/Youtube";

type FooterProps = {
  type?: number;
};

export default function Footer({ type }: FooterProps) {
  return (
    <footer className="footer-section-wrapper bg-white print:hidden">
      <div className="container-x block mx-auto pt-[56px]">
        <div className="w-full flex flex-col items-center mb-[50px]">
          {/* logo area */}
          <div className="mb-[40px]">
            {type === 3 ? (
              <Link to="/">
                <img
                  width={152}
                  height={36}
                  src={`${
                    import.meta.env.VITE_PUBLIC_URL
                  }/assets/images/logo-3.svg`}
                  alt="logo"
                />
              </Link>
            ) : (
              <Link to="/">
                <img
                  width={152}
                  height={36}
                  src={`${
                    import.meta.env.VITE_PUBLIC_URL
                  }/assets/images/logo.svg`}
                  alt="logo"
                />
              </Link>
            )}
          </div>
          <div className="w-full h-[1px] bg-[#E9E9E9]"></div>
        </div>

        {/* üst kısımdaki 3 kolon */}
        <div className="lg:flex justify-between mb-[50px]">
          <div className="lg:w-[424px] w-full mb-10 lg:mb-0">
            <h1 className="text-[18px] font-500 text-[#2F2F2F] mb-5">
              About Us
            </h1>
            <p className="text-[#9A9A9A] text-[15px] w-[247px] leading-[28px]">
              We know there are a lot of threa developers our but we pride into
              a firm in the industry.
            </p>
          </div>

          <div className="flex-1 lg:flex">
            {/* Feature */}
            <div className="lg:w-1/3 w-full mb-10 lg:mb-0">
              <h6 className="text-[18px] font-500 text-[#2F2F2F] mb-5">
                Feature
              </h6>
              <ul className="flex flex-col space-y-4">
                <li>
                  <Link to="/about">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack cursor-pointer capitalize">
                      About Us
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/terms-condition">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack cursor-pointer capitalize">
                      Terms Condition
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/all-products">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack cursor-pointer capitalize">
                      Best Products
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* General Links */}
            <div className="lg:w-1/3 lg:flex lg:flex-col items-center w-full mb-10 lg:mb-0">
              <h6 className="text-[18px] font-500 text-[#2F2F2F] mb-5">
                General Links
              </h6>
              <ul className="flex flex-col space-y-4">
                <li>
                  <Link to="/blogs">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack cursor-pointer capitalize">
                      Blog
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/tracking-order">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack cursor-pointer capitalize">
                      Tracking Order
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/become-saller">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack cursor-pointer capitalize">
                      Become Seller
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Helpful */}
            <div className="lg:w-1/3 lg:flex lg:flex-col items-center w-full mb-10 lg:mb-0">
              <h6 className="text-[18px] font-500 text-[#2F2F2F] mb-5">
                Helpful
              </h6>
              <ul className="flex flex-col space-y-4">
                <li>
                  <Link to="/flash-sale">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack cursor-pointer capitalize">
                      Flash Sale
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/faq">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack cursor-pointer capitalize">
                      FAQ
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/about">
                    <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack cursor-pointer capitalize">
                      Support
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="bottom-bar border-t border-qgray-border lg:h-[82px] lg:flex justify-between items-center">
          <div className="flex lg:space-x-5 justify-between items-center mb-3">
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
            <span className="sm:text-base text-[10px] text-qgray font-300">
              ©2022
              <a
                href="https://quomodosoft.com/"
                target="_blank"
                rel="noreferrer"
                className="font-500 text-qblack mx-1"
              >
                Quomodosoft
              </a>
              All rights reserved
            </span>
          </div>
          <div>
            <a href="#">
              <img
                width={318}
                height={28}
                src={`${
                  import.meta.env.VITE_PUBLIC_URL
                }/assets/images/payment-getways.png`}
                alt="payment-getways"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

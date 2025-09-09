import Star from "../Helpers/icons/Star";
import InputCom from "../Helpers/InputCom";
import PageTitle from "../Helpers/PageTitle";
import Layout from "../Partials/Layout";

type BreadcrumbItem = {
  name: string;
  path: string;
};

export default function ProductsCompaire() {
  const breadcrumb: BreadcrumbItem[] = [
    { name: "home", path: "/" },
    { name: "compaire", path: "/products-compaire" },
  ];

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="products-compaire-wrapper w-full bg-white pb-[40px]">
        <div className="w-full mb-5">
          <PageTitle breadcrumb={breadcrumb} title="Product Comparison" />
        </div>

        <div className="container-x mx-auto">
          <div className="w-full border border-qgray-border">
            <table className="table-wrapper">
              <tbody>
                {/* Product Row */}
                <tr className="table-row-wrapper">
                  <td className="w-[233px] pt-[30px] px-[26px] align-top bg-[#FAFAFA]">
                    <h1 className="text-[18px] font-medium text-qblack mb-4">
                      Product Comparison
                    </h1>
                    <p className="text-[13px] text-qgraytwo">
                      Select products to see the differences and similarities
                      between them
                    </p>
                  </td>

                  {[15, 16, 12, 11].map((img, idx) => (
                    <td
                      key={idx}
                      className="product w-[235px] bg-white p-6 border-b border-r border-qgray-border"
                    >
                      <div className="w-full mb-[30px]">
                        <div className="w-full h-[44px]">
                          <InputCom
                            type="text"
                            placeholder="Search Product..."
                            inputClasses="w-full h-full px-2"
                          >
                            <div
                              className="absolute right-2 z-10 bg-white"
                              style={{ top: "calc(100% - 28px)" }}
                            >
                              <svg
                                width="17"
                                height="17"
                                viewBox="0 0 17 17"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M11.0821 12.2955C10.0273 13.0961 8.71195 13.5712 7.2856 13.5712C3.81416 13.5712 1 10.757 1 7.2856C1 3.81416 3.81416 1 7.2856 1C10.757 1 13.5712 3.81416 13.5712 7.2856C13.5712 8.97024 12.9085 10.5001 11.8295 11.6286L11.6368 11.436L10.9297 12.1431L11.0821 12.2955ZM11.795 13.0084C10.5546 13.9871 8.98829 14.5712 7.2856 14.5712C3.26187 14.5712 0 11.3093 0 7.2856C0 3.26187 3.26187 0 7.2856 0C11.3093 0 14.5712 3.26187 14.5712 7.2856C14.5712 9.24638 13.7966 11.0263 12.5367 12.3359L16.4939 16.293L15.7868 17.0001L11.795 13.0084Z"
                                  fill="#181B31"
                                />
                              </svg>
                            </div>
                          </InputCom>
                        </div>
                      </div>

                      <div className="product-img flex justify-center mb-3">
                        <div className="w-[161px] h-[161px]">
                          <img
                            src={`${
                              import.meta.env.VITE_PUBLIC_URL
                            }/assets/images/product-img-${img}.jpg`}
                            alt="product"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      <p className="text-center text-[15px] font-medium text-qblack leading-[24px] mb-2">
                        Apple MacBook Air 13.3-Inch Display
                      </p>
                      <p className="text-center text-[15px] font-medium text-qred leading-[24px]">
                        $6.99
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Star Rating Row */}
                <tr className="table-row-wrapper">
                  <td className="w-[233px] px-[26px] align-top bg-[#FAFAFA]">
                    <h1 className="text-[15px] font-medium text-qblack">
                      Star Rating
                    </h1>
                  </td>
                  {[...Array(4)].map((_, idx) => (
                    <td
                      key={idx}
                      className="product w-[235px] bg-white px-6 border-r border-qgray-border pb-[20px] align-top"
                    >
                      <div className="flex space-x-2 items-center">
                        <span className="text-[15px] font-medium text-qblack">
                          4.8
                        </span>
                        <div className="flex items-center">
                          <Star />
                          <Star />
                          <Star />
                          <Star />
                          <Star />
                        </div>
                        <span className="text-[13px] font-normal text-qgraytwo">
                          (10)
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Diğer satırlar burada aynı mantıkla devam ediyor */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

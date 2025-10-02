import React from "react";
export type Crumb = {
  name: string;
  path: string;
};

export interface PageTitleProps {
  title: string;
  breadcrumb: Crumb[]; // ✅ string[] yerine Crumb[]
}

const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  return (
    <div className="page-title-wrapper bg-[#FFFAEF] w-full h-[173px] py-10">
      <div className="container-x mx-auto">
        <div className="mb-5"></div>
        <div className="flex justify-center">
          <h1 className="text-3xl font-semibold text-qblack">{title}</h1>
        </div>
      </div>
    </div>
  );
};
export default PageTitle;

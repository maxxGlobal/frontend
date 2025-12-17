 
import type { ReactNode } from "react"; 

type ViewMoreTitleProps = {
  categoryTitle?: string;
  className?: string;
  children?: ReactNode;
  seeMoreUrl?: string;
};

export default function ViewMoreTitle({
  categoryTitle = "",
  className,
  children, 
}: ViewMoreTitleProps) { 
  return (
    <div className={`section-wrapper w-full ${className || ""}`}>
      <div className="container-x mx-auto">
        <div className="section-title flex justify-between items-center mb-5">
          <div>
            <h1 className="sm:text-3xl text-xl font-600 text-qblacktext leading-none">
              {categoryTitle}
            </h1>
          </div>
          <div>
             
          </div>
        </div>
        <div className="section-content">{children}</div>
      </div>
    </div>
  );
}

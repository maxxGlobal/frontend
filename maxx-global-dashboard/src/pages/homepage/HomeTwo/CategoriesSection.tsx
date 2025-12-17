import { useNavigate } from "react-router-dom";
import { getMedicalIcon } from "../../../../public/assets/icons/MedicalIcons";
import { type CatNode } from "../../../services/categories/buildTree";
import { useTranslation } from "react-i18next";
import { useAllCategoryTree } from "../../../services/categories/queries";

export default function CategoriesSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: roots = [] } = useAllCategoryTree();

  const handlePick = (cat: CatNode) => {
    navigate(`/homepage/all-product?cat=${cat.id}`);
  };

  return (
    <div className="categories-section-wrapper w-full">
      <div className="container-x mx-auto p-0">
        <div className="w-full categories-items">
          <div className="grid xl:grid-cols-6 sm:grid-cols-4 grid-cols-2 gap-10 mb-[46px]">
            {roots.map((cat) => {
              return (
                <div
                  key={cat.id}
                  className="item w-full group cursor-pointer"
                  onClick={() => handlePick(cat)}
                >
                  <div className="w-full flex justify-start">
                    <div className="w-[110px] h-[110px] rounded-full bg-[#EEF1F1] group-hover:bg-qh2-green mb-2.5 flex justify-center items-center">
                      <span className="text-qblack group-hover:invert">
                        {getMedicalIcon(cat.name, "w-10 h-10")}
                      </span>
                    </div>
                  </div>
                  <div className="w-full flex justify-start">
                    <p className="text-center text-qblack text-base leading-snug max-w-[140px]">
                      {cat.name.split("-").map((part, idx) => (
                        <span
                          key={idx}
                          className={
                            idx === 0 ? "text-qh2-green font-600" : "block"
                          }
                        >
                          {part.trim()}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              );
            })}
            {roots.length === 0 && (
              <div className="col-span-full text-center text-sm text-gray-500">
                {t("pages.homeTwo.categories.empty")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

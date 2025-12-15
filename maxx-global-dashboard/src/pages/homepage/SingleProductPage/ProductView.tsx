import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type ImgItem = { id: number | string; url: string; isPrimary?: boolean };
const PLACEHOLDER = "/assets/img/resim-yok.jpg";

type Props = {
  name?: string | null;
  images?: ImgItem[];
  primaryImageUrl?: string | null;
};

export default function ProductView({ name, images, primaryImageUrl }: Props) {
  const { t } = useTranslation();
  // 🔑 Görsel listesi: önce images, sonra primaryImageUrl, yoksa placeholder
  const list = useMemo<ImgItem[]>(() => {
    if (images && images.length > 0) return images.filter((i) => !!i.url);
    if (primaryImageUrl)
      return [{ id: "primary", url: primaryImageUrl, isPrimary: true }];
    return [];
  }, [images, primaryImageUrl]);

  // aktif index: primary varsa o, yoksa 0
  const initialIdx = useMemo(() => {
    const prim = list.findIndex((x) => x.isPrimary);
    return prim >= 0 ? prim : 0;
  }, [list]);

  const [activeIdx, setActiveIdx] = useState<number>(initialIdx);

  if (list.length === 0) {
    return (
      <div data-aos="fade-right" className="lg:w-1/2 xl:mr-[70px] lg:mr-[50px]">
        <div className="w-full">
          <div className="w-full h-[600px] border border-qgray-border flex justify-center items-center overflow-hidden relative mb-3">
            <img
              src={PLACEHOLDER}
              alt={name || t("pages.singleProduct.fallbackName")}
              className="object-contain"
              onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
            />
          </div>
        </div>
      </div>
    );
  }

  // ✅ Normal galeri
  return (
    <div data-aos="fade-right" className="lg:w-1/2 xl:mr-[70px] lg:mr-[50px]">
      <div className="w-full">
        {/* Ana Görsel */}
        <div className="w-full h-[600px] border border-qgray-border flex justify-center items-center overflow-hidden relative mb-3">
          <img
            src={list[activeIdx].url}
            alt={name || t("pages.singleProduct.fallbackName")}
            className="object-contain"
            onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
          />
        </div>

        {/* Thumbnail Listesi */}
        <div className="flex gap-2 flex-wrap">
          {list.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => setActiveIdx(idx)}
              className="w-[110px] h-[110px] p-[15px] border border-qgray-border cursor-pointer"
            >
              <img
                src={img.url}
                alt={name || t("pages.singleProduct.fallbackName")}
                className={`w-full h-full object-contain ${
                  activeIdx !== idx ? "opacity-50" : ""
                }`}
                onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

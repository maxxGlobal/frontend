// src/pages/dealers/DealerPricesPage.tsx
import { useParams } from "react-router-dom";
import ProductPriceExcelPanel from "../products/components/ProductPriceExcelPanel";

export default function DealerPricesPage() {
  const { dealerId } = useParams<{ dealerId: string }>();
  return (
    <div className="container mt-4">
      <h3>Bayi Fiyat Excel İşlemleri</h3>
      {dealerId && <ProductPriceExcelPanel dealerId={Number(dealerId)} />}
    </div>
  );
}

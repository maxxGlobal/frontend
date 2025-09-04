// src/pages/products/ProductPriceManagement.tsx
import React from "react";
import ProductPriceManagementPanel from "./components/ProductPriceManagementPanel";

export default function ProductPriceManagement() {
  return (
    <div className="sherah-dsinner">
      <div className="sherah-card__body">
        <div className="sherah-page-inner sherah-default-bg sherah-border">
          <ProductPriceManagementPanel />
        </div>
      </div>
    </div>
  );
}

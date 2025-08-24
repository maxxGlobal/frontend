export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface ProductRow {
  id: number;
  name: string;
  code: string;
  categoryName?: string | null;
  primaryImageUrl?: string | null;
  stockQuantity?: number | null;
  unit?: string | null;
  isActive?: boolean | null;
  isInStock?: boolean | null;
}

export interface Product extends ProductRow {
  description?: string | null;
  categoryId?: number | null;
  material?: string | null;
  size?: string | null;
  diameter?: string | null;
  angle?: string | null;
  sterile?: boolean | null;
  singleUse?: boolean | null;
  implantable?: boolean | null;
  ceMarking?: boolean | null;
  fdaApproved?: boolean | null;
  medicalDeviceClass?: string | null;
  regulatoryNumber?: string | null;
  weightGrams?: number | null;
  dimensions?: string | null;
  color?: string | null;
  surfaceTreatment?: string | null;
  serialNumber?: string | null;
  manufacturerCode?: string | null;
  manufacturingDate?: string | null;
  expiryDate?: string | null;
  shelfLifeMonths?: number | null;
  barcode?: string | null;
  lotNumber?: string | null;
  minimumOrderQuantity?: number | null;
  maximumOrderQuantity?: number | null;
  images?: ProductImage[];
  isExpired?: boolean | null;
  createdDate?: string | null;
  updatedDate?: string | null;
  status?: "ACTIVE" | "PASSIVE" | "DELETED" | string | null;
}

export interface ProductCreateRequest {
  name: string;
  code: string;
  description?: string;
  categoryId: number; // zorunlu
  material?: string;
  size?: string;
  diameter?: string;
  angle?: string;
  sterile?: boolean;
  singleUse?: boolean;
  implantable?: boolean;
  ceMarking?: boolean;
  fdaApproved?: boolean;
  medicalDeviceClass?: string;
  regulatoryNumber?: string;
  weightGrams?: number;
  dimensions?: string;
  color?: string;
  surfaceTreatment?: string;
  serialNumber?: string;
  manufacturerCode?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  shelfLifeMonths?: number;
  unit?: string;
  barcode?: string;
  lotNumber?: string;
  stockQuantity?: number;
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  isActive?: boolean;
}

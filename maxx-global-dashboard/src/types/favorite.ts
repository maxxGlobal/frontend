export type FavoriteRequest = {
  productId: number;
};

export type FavoriteResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
    product: {
      id: number;
      name: string;
      code: string;
      categoryName: string;
      primaryImageUrl: string;
      stockQuantity: number;
      unit: string;
      isActive: boolean;
      isInStock: boolean;
      status: string;
      isFavorite: boolean;
    };
    createdAt: string;
    updatedAt: string;
  };
  timestamp: string;
  code: number;
}; 

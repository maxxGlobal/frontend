// src/types/dashboard.ts

export interface RecentActivity {
  id: number;
  activityType: string;
  title: string;
  description: string;
  userName: string;
  relatedEntityId: string;
  relatedEntityType: string;
  actionUrl: string;
  createdAt: string;
  icon: string;
  color: string;
}

export interface StatisticsResponse {
  userStats: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  };
  dealerStats: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  productStats: {
    total: number;
    inStock: number;
    outOfStock: number;
    expired: number;
    withoutImages: number;
  };
  orderStats: {
    total: number;
    pending: number;
    approved: number;
    completed: number;
    cancelled: number;
    shipped: number;
    rejected: number;
    thisMonth: number;
    totalRevenue: number;
  };
}

export interface OverviewResponse {
  totalUsers: number;
  activeUsers: number;
  totalDealers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrdersThisMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowthPercentage: number;
  averageOrderValueThisMonth: number;
  lowStockProducts: number;
  expiringProducts: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  productCode: string;
  categoryName: string;
  totalQuantityOrdered: number;
  orderCount: number;
  totalRevenue: number;
  rank: number;
}

export interface TopDealer {
  dealerId: number;
  dealerName: string;
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  rank: number;
}

export interface RevenueTrend {
  month: string;
  monthName: string;
  revenue: number;
  changePercentage: number;
}

export interface MonthlyOrder {
  month: string;
  monthName: string;
  orderCount: number;
  revenue: number;
}

export interface DiscountEffectiveness {
  // boş array gelebilir
  period: string;
  discounts: any[];
}

export type DashboardRefreshMessage = string;

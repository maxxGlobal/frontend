export interface NotificationType {
  name: string;
  displayName: string;
  category: string;
  icon: string;
  description: string;
}

/** Admin broadcast isteği */
export interface AdminBroadcastRequest {
  title: string;
  message: string;
  type: string; // NotificationType.name
  relatedEntityId?: number | null;
  relatedEntityType?: string | null;
  priority?: string | null;
  icon?: string | null;
  actionUrl?: string | null;
  data?: string | null;

  // hedefleme
  specificUserIds?: number[];
  targetRole?: string | null;
  targetDealerIds?: number[];
  targetDealerId?: number;
  sendToAll?: boolean;
}

/** Genel envelope’ünle uyumlu tip (dilersen daraltırsın) */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string | null;
  data: T;
  code?: number;
  timestamp?: string;
}

export type NotificationRow = {
  id: number;
  title: string;
  message: string;
  type: string;
  typeDisplayName?: string;
  typeCategory?: string;
  notificationStatus: "UNREAD" | "READ";
  statusDisplayName?: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
  readAt?: string | null;
  priority?: string | null;
  icon?: string | null;
  actionUrl?: string | null;
  data?: string | null;
  createdAt: string;
  isRead?: boolean;
  timeAgo?: number;
};

export type NotificationsListRequest = {
  page?: number;
  size?: number;
  q?: string;
  type?: string;
  status?: "UNREAD" | "READ" | "";
};

export type NotificationsListResponse = {
  content: NotificationRow[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export interface NotificationSummary {
  totalCount: number;
  unreadCount: number;
  readCount: number;
  archivedCount: number;
  todayCount: number;
  thisWeekCount: number;
  highPriorityUnreadCount: number;
}

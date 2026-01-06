const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5044/api';

// Types matching backend DTOs
export interface NotificationDto {
  id: number;
  userId: number;
  type: NotificationType;
  typeName: string;
  channel: NotificationChannel;
  channelName: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  referenceType: string | null;
  referenceId: number | null;
  actionUrl: string | null;
  metadata: string | null;
  priority: NotificationPriority;
  priorityName: string;
  createdAt: string;
  timeAgo: string;
}

export interface CreateNotificationDto {
  userId: number;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  referenceType?: string;
  referenceId?: number;
  actionUrl?: string;
  metadata?: string;
  priority: NotificationPriority;
}

export interface PagedResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export enum NotificationType {
  LoanRequestCreated = 1,
  LoanRequestApproved = 2,
  LoanRequestRejected = 3,
  LoanRequestPacking = 4,
  LoanRequestSent = 5,
  LoanRequestOverdue = 6,
  TransferRequestCreated = 10,
  TransferRequestApproved = 11,
  TransferRequestRejected = 12,
  TransferRequestCompleted = 13,
  PurchaseRequestCreated = 20,
  PurchaseRequestApproved = 21,
  PurchaseRequestRejected = 22,
  PurchaseRequestReceived = 23,
  InventoryLowStock = 30,
  InventoryCriticalStock = 31,
  InventoryOutOfStock = 32,
  InventoryAdjusted = 33,
  CycleCountAssigned = 40,
  CycleCountCompleted = 41,
  CycleCountDiscrepancy = 42,
  ReturnRequestCreated = 50,
  ReturnRequestApproved = 51,
  ReturnRequestRejected = 52,
  SystemAlert = 100,
  UserMention = 101,
  TaskAssigned = 102,
}

export enum NotificationChannel {
  InApp = 1,
  Email = 2,
  Both = 3,
}

export enum NotificationPriority {
  Low = 1,
  Normal = 2,
  High = 3,
  Critical = 4,
}

class NotificationsService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('mro_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  /**
   * Get notifications for current user with pagination
   */
  async getNotifications(
    pageNumber: number = 1,
    pageSize: number = 20,
    unreadOnly: boolean = false
  ): Promise<PagedResponse<NotificationDto>> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
      unreadOnly: unreadOnly.toString(),
    });

    const response = await fetch(
      `${API_URL}/notifications?${params}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse<PagedResponse<NotificationDto>>(response);
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    const response = await fetch(
      `${API_URL}/notifications/unread-count`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse<number>(response);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: number): Promise<void> {
    const response = await fetch(
      `${API_URL}/notifications/${notificationId}/mark-as-read`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse<void>(response);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ markedCount: number }> {
    const response = await fetch(
      `${API_URL}/notifications/mark-all-as-read`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse<{ markedCount: number }>(response);
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<void> {
    const response = await fetch(
      `${API_URL}/notifications/${notificationId}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse<void>(response);
  }

  /**
   * Create a new notification (for Managers/Directors/Keepers)
   */
  async createNotification(dto: CreateNotificationDto): Promise<NotificationDto> {
    const response = await fetch(
      `${API_URL}/notifications`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      }
    );

    return this.handleResponse<NotificationDto>(response);
  }
}

export const notificationsService = new NotificationsService();

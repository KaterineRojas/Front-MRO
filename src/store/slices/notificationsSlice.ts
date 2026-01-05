import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  notificationsService,
  NotificationDto,
  CreateNotificationDto,
  NotificationType,
  NotificationPriority
} from '../../services/notificationsService';

// Mapped notification interface for UI (simplified from backend DTO)
export interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string; // timeAgo from backend
  read: boolean; // isRead from backend
  type: 'info' | 'warning' | 'success' | 'error';
  actionUrl?: string | null;
  priority: number;
  createdAt: string;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
};

// Helper function to map NotificationType to UI type
const mapNotificationTypeToUIType = (backendType: NotificationType): 'info' | 'warning' | 'success' | 'error' => {
  // Approved/Success types
  if ([
    NotificationType.LoanRequestApproved,
    NotificationType.TransferRequestApproved,
    NotificationType.PurchaseRequestApproved,
    NotificationType.ReturnRequestApproved,
    NotificationType.CycleCountCompleted,
  ].includes(backendType)) {
    return 'success';
  }

  // Rejected/Error types
  if ([
    NotificationType.LoanRequestRejected,
    NotificationType.TransferRequestRejected,
    NotificationType.PurchaseRequestRejected,
    NotificationType.ReturnRequestRejected,
    NotificationType.InventoryCriticalStock,
    NotificationType.InventoryOutOfStock,
  ].includes(backendType)) {
    return 'error';
  }

  // Warning types
  if ([
    NotificationType.LoanRequestOverdue,
    NotificationType.InventoryLowStock,
    NotificationType.CycleCountDiscrepancy,
  ].includes(backendType)) {
    return 'warning';
  }

  // Default to info
  return 'info';
};

// Helper function to map backend DTO to UI Notification
const mapDtoToNotification = (dto: NotificationDto): Notification => ({
  id: dto.id,
  title: dto.title,
  message: dto.message,
  timestamp: dto.timeAgo,
  read: dto.isRead,
  type: mapNotificationTypeToUIType(dto.type),
  actionUrl: dto.actionUrl,
  priority: dto.priority,
  createdAt: dto.createdAt,
});

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ pageNumber = 1, pageSize = 50, unreadOnly = false }: {
    pageNumber?: number;
    pageSize?: number;
    unreadOnly?: boolean
  } = {}) => {
    const response = await notificationsService.getNotifications(pageNumber, pageSize, unreadOnly);
    return response;
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async () => {
    const count = await notificationsService.getUnreadCount();
    return count;
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: number) => {
    await notificationsService.markAsRead(notificationId);
    return notificationId;
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    const result = await notificationsService.markAllAsRead();
    return result;
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: number) => {
    await notificationsService.deleteNotification(notificationId);
    return notificationId;
  }
);

export const createNotification = createAsyncThunk(
  'notifications/createNotification',
  async (dto: CreateNotificationDto) => {
    const notification = await notificationsService.createNotification(dto);
    return notification;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Local actions for optimistic updates
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const newId = state.items.length > 0 ? Math.max(...state.items.map(n => n.id)) + 1 : 1;
      state.items.unshift({ ...action.payload, id: newId });
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearAllNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.currentPage = 1;
      state.totalPages = 1;
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.data.map(mapDtoToNotification);
      state.currentPage = action.payload.pageNumber;
      state.totalPages = action.payload.totalPages;
      state.totalCount = action.payload.totalCount;
      // Update unread count
      state.unreadCount = state.items.filter(n => !n.read).length;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch notifications';
    });

    // Fetch unread count
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });

    // Mark as read
    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      const notification = state.items.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // Mark all as read
    builder.addCase(markAllNotificationsAsRead.fulfilled, (state) => {
      state.items.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    });

    // Delete notification
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const notification = state.items.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.items = state.items.filter(n => n.id !== action.payload);
    });

    // Create notification
    builder.addCase(createNotification.fulfilled, (state, action) => {
      const newNotification = mapDtoToNotification(action.payload);
      state.items.unshift(newNotification);
      if (!newNotification.read) {
        state.unreadCount += 1;
      }
    });
  },
});

export const {
  addNotification,
  clearError,
  clearAllNotifications,
} = notificationsSlice.actions;

// Legacy exports for backward compatibility (deprecated)
export const markAsRead = markNotificationAsRead;
export const markAllAsRead = markAllNotificationsAsRead;
export const removeNotification = deleteNotification;

export default notificationsSlice.reducer;

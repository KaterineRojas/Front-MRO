import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: [
    {
      id: 1,
      title: 'New Request Pending',
      message: 'Mike Chen submitted a loan request (REQ-2025-001)',
      timestamp: '5 minutes ago',
      read: false,
      type: 'warning'
    },
    {
      id: 2,
      title: 'Low Stock Alert',
      message: 'USB Cable Type-C 2m stock is below minimum threshold',
      timestamp: '1 hour ago',
      read: false,
      type: 'error'
    },
    {
      id: 3,
      title: 'Request Approved',
      message: 'Your purchase request REQ-2025-005 has been approved',
      timestamp: '2 hours ago',
      read: false,
      type: 'success'
    },
    {
      id: 4,
      title: 'Return Reminder',
      message: 'Equipment borrowed by Linda Martinez is due tomorrow',
      timestamp: '3 hours ago',
      read: true,
      type: 'info'
    },
    {
      id: 5,
      title: 'Cycle Count Scheduled',
      message: 'Monthly cycle count scheduled for next Monday',
      timestamp: '1 day ago',
      read: true,
      type: 'info'
    }
  ],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const newId = state.items.length > 0 ? Math.max(...state.items.map(n => n.id)) + 1 : 1;
      state.items.unshift({ ...action.payload, id: newId });
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.items.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(notification => {
        notification.read = true;
      });
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.items = [];
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '../../../enginner/types/index';

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: [
    {
      id: '1',
      message: 'Your borrow request #LP001 has been approved',
      type: 'success',
      timestamp: '2024-01-15T10:30:00Z',
      read: false
    },
    {
      id: '2',
      message: 'Reminder: Return laptop DELL-001 tomorrow',
      type: 'warning',
      timestamp: '2024-01-15T09:00:00Z',
      read: false
    },
    {
      id: '3',
      message: 'New transfer received from Juan Pérez',
      type: 'info',
      timestamp: '2024-01-14T16:45:00Z',
      read: true
    }
  ]
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(n => n.id !== action.payload);
    }
  }
});

export const { markAsRead, addNotification, removeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;

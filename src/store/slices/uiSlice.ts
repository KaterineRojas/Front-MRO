import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  currentPage: any;
  sidebarOpen: boolean;
  darkMode: boolean;
  notificationsOpen: boolean;
}

const initialState: UIState = {
  sidebarOpen: false,
  darkMode: (() => {
    try {
      const stored = localStorage.getItem('mro_dark_mode');
      if (stored !== null) {
        return JSON.parse(stored);
      }
      // Fallback a preferencia del sistema
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  })(),
  notificationsOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      try {
        localStorage.setItem('mro_dark_mode', JSON.stringify(state.darkMode));
      } catch {
        // Fail silently si localStorage no está disponible
      }
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      try {
        localStorage.setItem('mro_dark_mode', JSON.stringify(action.payload));
      } catch {
        // Fail silently
      }
    },
    toggleNotifications: (state) => {
      state.notificationsOpen = !state.notificationsOpen;
    },
    setNotificationsOpen: (state, action: PayloadAction<boolean>) => {
      state.notificationsOpen = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  toggleNotifications,
  setNotificationsOpen,
} = uiSlice.actions;

export default uiSlice.reducer;

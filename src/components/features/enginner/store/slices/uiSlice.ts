import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Page } from '../../App';

interface UiState {
  currentPage: Page;
  darkMode: boolean;
}

const initialState: UiState = {
  currentPage: 'dashboard',
  darkMode: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<Page>) => {
      state.currentPage = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    }
  }
});

export const { setCurrentPage, toggleDarkMode, setDarkMode } = uiSlice.actions;
export default uiSlice.reducer;

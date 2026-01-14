import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/index';

interface UserState {
  currentUser: User | null;
  isLoggedIn: boolean;
  token: string | null;
}

// Estado inicial sin lógica de tokens
const initialState: UserState = {
  currentUser: {
    id: 'amx0142',
    name: 'John Smith',
    email: 'john@company.com',
    department: 'IT-Bolivia'
  },
  isLoggedIn: true,
  token: null
};

const userSlice = createSlice({
  name: 'engineerUser',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    login: (state, action: PayloadAction<{ user: User; token?: string }>) => {
      state.currentUser = action.payload.user;
      state.isLoggedIn = true;
      state.token = action.payload.token || null;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isLoggedIn = false;
      state.token = null;
    }
  }
});

export const { setUser, updateUser, login, logout } = userSlice.actions;
export default userSlice.reducer;

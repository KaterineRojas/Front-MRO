import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'administrator' | 'user' | 'purchasing' | 'auditor' | 'manager';

interface User {
  id: number;
  name: string;
  role: UserRole;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: {
    id: 1,
    name: 'John Smith',
    role: 'administrator',
    email: 'john@company.com'
  },
  isAuthenticated: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    updateUserRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
  },
});

export const { setUser, logout, updateUserRole } = authSlice.actions;
export default authSlice.reducer;

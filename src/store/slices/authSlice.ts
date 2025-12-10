import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'administrator' | 'user' | 'purchasing' | 'auditor' | 'manager';

interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  department: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
//se esta usando este usuario para las pruebas en transfer
// User ID: amx014* (Engineer user)
const initialState: AuthState = {
  user: {
    id: 'amx0143',
    name: 'Orlando Lopez',
    role: 'administrator',
    email: 'orlando.lopez@company.com',
    department: 'IT-Bolivia'
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

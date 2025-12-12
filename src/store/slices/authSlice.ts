import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'administrator' | 'user' | 'purchasing' | 'auditor' | 'manager';

interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: number;
  roleName: string;
  department: string;
  photoUrl?: string;
  jobTitle?: string;
  mobilePhone?: string;
  officeLocation?: string;
  warehouse?: number;
}

export type AuthType = 'local' | 'azure' | null;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  isLoading: boolean;
  authType: AuthType; // Track how the user authenticated
}
//se esta usando este usuario para las pruebas en transfer
// User ID: amx014* (Engineer user)
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  isLoading: true, // true initially while checking authentication
  authType: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    setAuth: (state, action: PayloadAction<{ user: User; accessToken: string; authType: AuthType }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.authType = action.payload.authType;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setUserPhoto: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.photoUrl = action.payload;
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.authType = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUserRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        state.user.roleName = action.payload;
      }
    },
  },
});

export const { setUser, setAccessToken, setAuth, logout, setLoading, updateUserRole, setUserPhoto } = authSlice.actions;
export default authSlice.reducer;

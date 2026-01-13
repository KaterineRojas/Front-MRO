import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'Engineer' | 'Keeper' | 'Manager' | 'Director';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roleName: string;
  department: string;
  departmentId?: string;
  departmentName?: string;
  employeeId?: string;
  warehouseId?: number;
  photoUrl?: string;
  jobTitle?: string;
  mobilePhone?: string;
  officeLocation?: string;
  warehouse?: number;
  backendAuthType?: number; // 0=Local, 1=Azure, 2=Both - from backend
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
      // Note: isLoading is NOT set to false here - it will be set manually after UI is ready
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

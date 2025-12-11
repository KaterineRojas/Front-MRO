import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'administrator' | 'user' | 'purchasing' | 'auditor' | 'manager';

interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  department: string;
  photoUrl?: string;
  jobTitle?: string;
  mobilePhone?: string;
  officeLocation?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  isLoading: boolean;
}
//se esta usando este usuario para las pruebas en transfer
// User ID: amx014* (Engineer user)
const initialState: AuthState = {
<<<<<<< HEAD
  user: {
    id: 'amx0144',
    name: 'Orlando Lopez',
    role: 'administrator',
    email: 'orlando.lopez@company.com',
    department: 'IT-Bolivia'
  },
  isAuthenticated: true,
=======
  user: null,
  isAuthenticated: false,
  accessToken: null,
  isLoading: true, // true initially while checking authentication
>>>>>>> 28da26693e53982caf95935cb33323bde5ddc430
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
    setAuth: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
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
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUserRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
  },
});

export const { setUser, setAccessToken, setAuth, logout, setLoading, updateUserRole, setUserPhoto } = authSlice.actions;
export default authSlice.reducer;

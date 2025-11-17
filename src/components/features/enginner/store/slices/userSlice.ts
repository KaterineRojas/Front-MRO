import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
import { USE_AUTH_TOKENS } from '../../constants';
import { getUserData, isAuthenticated } from '../../services/authService';

interface UserState {
  currentUser: User | null;
  isLoggedIn: boolean;
  token: string | null;
}

// Estado inicial condicional basado en USE_AUTH_TOKENS
const getInitialState = (): UserState => {
  if (USE_AUTH_TOKENS) {
    // Si usa tokens, verificar si hay sesión guardada
    const savedUser = getUserData();
    const isAuth = isAuthenticated();
    
    return {
      currentUser: savedUser || null,
      isLoggedIn: isAuth,
      token: null // El token se maneja en authService
    };
  } else {
    // Si no usa tokens, usuario siempre autenticado
    return {
      currentUser: {
        id: '1',
        name: 'Carlos García',
        email: 'carlos.garcia@company.com',
        department: 'Engineering'
      },
      isLoggedIn: true,
      token: null
    };
  }
};

const initialState: UserState = getInitialState();

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

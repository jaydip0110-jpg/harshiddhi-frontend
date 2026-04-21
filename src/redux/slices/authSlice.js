import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

// ── API URL — Dev અને Production બંને માટે ──
const PROD_URL = 'https://harshiddhi-backend.onrender.com/api';
const DEV_URL  = 'http://localhost:5000/api';
const API_URL  = import.meta.env.MODE === 'production' ? PROD_URL : DEV_URL;

// ── Token Save ──
const saveToken = (data) => {
  try {
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userInfo',  JSON.stringify(data));
  } catch (_) {}
};

// ── Token Get ──
export const getToken = () => {
  try {
    const t1 = localStorage.getItem('userToken');
    if (t1) return t1;

    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const t2 = JSON.parse(userInfo)?.token;
      if (t2) return t2;
    }

    const persisted = localStorage.getItem('harshiddhi');
    if (persisted) {
      const t3 = JSON.parse(persisted)?.auth?.user?.token;
      if (t3) return t3;
    }
  } catch (_) {}
  return null;
};

// ── Initial User from Storage ──
const getUserFromStorage = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) return JSON.parse(userInfo);
  } catch (_) {}
  return null;
};

// ── Register ──
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const res  = await fetch(`${API_URL}/users/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      saveToken(data);
      toast.success(`Welcome, ${data.name}! 🌸`);
      return data;
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      return rejectWithValue(err.message);
    }
  }
);

// ── Login ──
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res  = await fetch(`${API_URL}/users/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      saveToken(data);
      toast.success(`Welcome back, ${data.name}! 🌸`);
      return data;
    } catch (err) {
      toast.error(err.message || 'Login failed');
      return rejectWithValue(err.message);
    }
  }
);

// ── Update Profile ──
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const token = getToken();
      const res   = await fetch(`${API_URL}/users/profile`, {
        method:  'PUT',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Profile updated!');
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Auth Slice ──
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    getUserFromStorage(),
    loading: false,
    error:   null,
  },
  reducers: {
    logout(state) {
      state.user    = null;
      state.error   = null;
      state.loading = false;
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      toast.success('Logged out successfully');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(register.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.user    = payload;
        s.error   = null;
      })
      .addCase(register.rejected,  (s, { payload }) => {
        s.loading = false;
        s.error   = payload;
      })
      .addCase(login.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(login.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.user    = payload;
        s.error   = null;
      })
      .addCase(login.rejected,  (s, { payload }) => {
        s.loading = false;
        s.error   = payload;
      })
      .addCase(updateProfile.fulfilled, (s, { payload }) => {
        s.user = { ...s.user, ...payload };
        localStorage.setItem('userInfo', JSON.stringify({ ...s.user, ...payload }));
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
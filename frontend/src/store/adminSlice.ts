import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi, AdminStats } from '../api/adminApi';

interface AdminState {
  stats: AdminStats | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  status: 'idle',
  error: null,
};

export const fetchAdminStats = createAsyncThunk('admin/fetchStats', async () => {
  return await adminApi.getStats();
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch admin stats';
      });
  },
});

export default adminSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryApi, Category } from '../api/categoryApi';

interface CategoryState {
  categories: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  status: 'idle',
  error: null,
};

export const fetchAllCategories = createAsyncThunk('category/fetchAll', async () => {
  return await categoryApi.getAllCategories();
});

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch categories';
      });
  },
});

export default categorySlice.reducer;

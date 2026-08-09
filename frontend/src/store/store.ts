import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import newsReducer from './newsSlice';
import adminReducer from './adminSlice';
import categoryReducer from './categorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    news: newsReducer,
    admin: adminReducer,
    category: categoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

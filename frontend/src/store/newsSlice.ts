import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Article, PagedResponse } from '../types/news';
import { newsApi } from '../api/newsApi';

interface NewsState {
  latestNews: PagedResponse<Article> | null;
  trendingNews: PagedResponse<Article> | null;
  categoryNews: Record<string, PagedResponse<Article>>;
  searchResults: PagedResponse<Article> | null;
  currentArticle: Article | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: NewsState = {
  latestNews: null,
  trendingNews: null,
  categoryNews: {},
  searchResults: null,
  currentArticle: null,
  status: 'idle',
  error: null,
};

export const fetchLatestNews = createAsyncThunk('news/fetchLatest', async ({ page = 0, size = 10 }: { page?: number; size?: number }) => {
  return await newsApi.getLatestNews(page, size);
});

export const fetchTrendingNews = createAsyncThunk('news/fetchTrending', async ({ page = 0, size = 10 }: { page?: number; size?: number }) => {
  return await newsApi.getTrendingNews(page, size);
});

export const fetchCategoryNews = createAsyncThunk('news/fetchCategory', async ({ category, page = 0, size = 10 }: { category: string; page?: number; size?: number }) => {
  const response = await newsApi.getNewsByCategory(category, page, size);
  return { category, data: response };
});

export const searchArticles = createAsyncThunk('news/search', async ({ query, page = 0, size = 10 }: { query: string; page?: number; size?: number }) => {
  return await newsApi.searchNews(query, page, size);
});

export const fetchArticleById = createAsyncThunk('news/fetchById', async (id: number) => {
  return await newsApi.getNewsById(id);
});

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Latest News
    builder.addCase(fetchLatestNews.pending, (state) => {
      state.status = 'loading';
    })
    .addCase(fetchLatestNews.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.latestNews = action.payload;
    })
    .addCase(fetchLatestNews.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message || 'Failed to fetch news';
    });

    // Trending News
    builder.addCase(fetchTrendingNews.fulfilled, (state, action) => {
      state.trendingNews = action.payload;
    });

    // Category News
    builder.addCase(fetchCategoryNews.fulfilled, (state, action) => {
      state.categoryNews[action.payload.category] = action.payload.data;
    });

    // Search
    builder.addCase(searchArticles.pending, (state) => {
      state.status = 'loading';
    })
    .addCase(searchArticles.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.searchResults = action.payload;
    });

    // Article by ID
    builder.addCase(fetchArticleById.pending, (state) => {
      state.status = 'loading';
    })
    .addCase(fetchArticleById.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.currentArticle = action.payload;
    });
  },
});

export default newsSlice.reducer;

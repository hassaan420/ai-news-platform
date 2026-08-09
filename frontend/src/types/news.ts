export interface Source {
  id: number;
  name: string;
  provider: string;
}

export interface Article {
  id: number;
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  author: string | null;
  source: Source;
  category: string;
  content?: string;
  summary?: string;
  sentiment?: string;
  sentimentScore?: number;
  readingTime?: number;
  topicClassification?: string;
  recommendationScore?: number;
  trendingScore?: number;
  aiConfidence?: number;
  processingStatus?: string;
  processedAt?: string;
  keywords?: string[];
  tags?: string[];
  relatedArticles?: Article[];
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type NewsResponse = Article;

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
  views?: number;
  bookmarks?: number;
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

export interface VerificationSourceDto {
  id: number;
  sourceName: string;
  url: string;
  publishedAt: string;
  similarityScore: number | null;
  relationship: string;
}

export interface VerificationConflictDto {
  id: number;
  claimText: string;
  conflictingSourceUrl: string;
}

export interface ArticleVerificationDto {
  id: number;
  status: string;
  verificationScore: number;
  sourcesFound: number;
  independentSources: number;
  lastVerifiedAt: string;
  sources: VerificationSourceDto[];
  conflicts: VerificationConflictDto[];
}

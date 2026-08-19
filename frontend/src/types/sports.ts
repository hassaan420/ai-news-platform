export interface SportMatch {
  id?: string | number;
  home?: string;
  away?: string;
  home_score?: number | string | null;
  away_score?: number | string | null;
  status?: string;
  status_text?: string;
  time?: string;
}

export interface SportResponse {
  matches?: SportMatch[];
}

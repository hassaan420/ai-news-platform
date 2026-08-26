import { SportResponse } from '../types/sports';

export const sportsApi = {
  getLiveMatches: async (sport: string, page: number = 1): Promise<SportResponse> => {
    // Calling the public, keyless API directly from the browser
    const url = `https://sportscore.com/api/widget/matches/?sport=${encodeURIComponent(sport)}&limit=10&page=${page}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sports data: ${response.statusText}`);
    }
    
    return await response.json();
  }
};

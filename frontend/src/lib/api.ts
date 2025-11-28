import { Movie, SearchMoviesResponse, FavoritesResponse } from '@movie-search/types';

// BUG: Hardcoded API URL, should use env var
const API_BASE_URL = 'http://localhost:3001/movies';

export const movieApi = {
  searchMovies: async (query: string, page: number = 1): Promise<SearchMoviesResponse> => {
    // BUG: No input validation
    // BUG: No error handling for network errors
    // BUG: Missing encodeURIComponent - will break with special characters
    const response = await fetch(`${API_BASE_URL}/search?q=${query}&page=${page}`);

    // BUG: Doesn't check response.ok before parsing
    // BUG: If response is not OK, response.json() might fail or return error object
    const data = await response.json();
    
    // BUG: Backend returns HttpException object when there's an error, not {error: ...}
    // This check will never catch backend errors properly
    if (data.error) {
      throw new Error(data.error);
    }
    
    // BUG: If backend returns error (HttpException object), it's returned as data
    // No check for response.status or response.ok
    return data;
  },

  getFavorites: async (page: number = 1): Promise<FavoritesResponse> => {
    // BUG: No error handling
    const response = await fetch(`${API_BASE_URL}/favorites/list?page=${page}`);
    
    // BUG: Doesn't handle 404 properly - will crash
    if (!response.ok) {
      throw new Error('Failed to get favorites');
    }
    
    return response.json();
  },

  addToFavorites: async (movie: Movie): Promise<void> => {
    // BUG: No validation that movie has required fields
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movie),
    });
    
    // BUG: Backend returns HttpException object (not thrown) when movie already exists
    // This means response.status might be 200 but data contains error
    // BUG: Doesn't check response.status properly - should check response.ok
    if (response.status !== 200) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add movie to favorites');
    }
    
    // BUG: Even if status is 200, backend might return HttpException object in body
    // Should check response body for error structure
  },

  removeFromFavorites: async (imdbID: string): Promise<void> => {
    // BUG: No validation
    const response = await fetch(`${API_BASE_URL}/favorites/${imdbID}`, {
      method: 'DELETE',
    });
    
    // BUG: Doesn't check response.ok
    if (response.status !== 200) {
      throw new Error('Failed to remove movie from favorites');
    }
  },
};


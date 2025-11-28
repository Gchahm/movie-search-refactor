import {Movie, SearchMoviesResponse, FavoritesResponse} from '@movie-search/types';

// BUG: Hardcoded API URL, should use env var
const API_BASE_URL = 'http://localhost:3001/movies';

export const movieApi = {
    searchMovies: async (query: string, page: number = 1): Promise<SearchMoviesResponse> => {
        // BUG: No input validation
        // BUG: No error handling for network errors
        // BUG: Missing encodeURIComponent - will break with special characters
        const response = await fetch(`${API_BASE_URL}/search?q=${query}&page=${page}`);

        if (!response.ok) {
            throw new Error('Failed to search for movies. Please try again later.');
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

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

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add movie to favorites');
        }
    },

    removeFromFavorites: async (imdbID: string): Promise<void> => {
        // BUG: No validation
        const response = await fetch(`${API_BASE_URL}/favorites/${imdbID}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to remove movie from favorites');
        }
    },
};


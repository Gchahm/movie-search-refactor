// BUG: Inconsistent type definitions, missing some fields
export interface Movie {
    title: string;
    imdbID: string;
    year: number;
    poster: string;
    isFavorite?: boolean;
}

export interface SearchMoviesResponse {
    data: {
        movies: Movie[];
        count: number;
        totalResults: string;
    };
}

export interface FavoritesResponse {
    data: {
        favorites: Movie[];
        count: number;
        totalResults: number; // BUG: Should be string to match API
        currentPage: number;
        totalPages: number;
    };
}


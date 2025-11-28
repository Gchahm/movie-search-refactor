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
        totalResults: number;
        currentPage: number;
        totalPages: number;
    };
}


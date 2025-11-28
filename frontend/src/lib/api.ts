import {Movie, MovieSchema, SearchMoviesQuery, SearchMoviesQueryDto, SearchMoviesResponse} from '@movie-search/types';

// Build base URL from env and normalize to avoid double slashes
function normalizeBaseUrl(url: string): string {
    // remove trailing slash
    return url.replace(/\/$/, '');
}

const RAW_BASE_URL = process.env.NEXT_PUBLIC_MOVIES_API_URL ?? 'http://localhost:3001/movies';
const API_BASE_URL = normalizeBaseUrl(RAW_BASE_URL);

type RequestOptions = RequestInit & { timeoutMs?: number };

class ApiError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {timeoutMs = 15000, ...init} = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(`${API_BASE_URL}${path}`, {...init, signal: controller.signal});

        const contentType = res.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const parseBody = async () => (isJson ? await res.json() : await res.text());

        if (!res.ok) {
            const body: any = await parseBody().catch(() => undefined);
            const message = (body && (body.message || body.error)) || `Request failed with status ${res.status}`;
            throw new ApiError(message, res.status);
        }

        // If no content
        if (res.status === 204) return undefined as unknown as T;

        const data = (await parseBody()) as T;
        return data;
    } catch (err: any) {
        if (err.name === 'AbortError') {
            throw new ApiError('Request timed out. Please try again.', 408);
        }
        if (err instanceof ApiError) {
            throw err;
        }
        // Network or unknown error
        throw new ApiError('Network error. Please check your connection and try again.');
    } finally {
        clearTimeout(id);
    }
}

function assertNonEmpty(value: string, fieldName: string) {
    if (!value || value.trim() === '') {
        throw new Error(`${fieldName} is required`);
    }
}

function assertPositivePage(page: number) {
    if (!Number.isFinite(page) || !Number.isInteger(page) || page < 1) {
        throw new Error('Page must be a positive integer');
    }
}

export const movieApi = {
    async searchMovies(query: SearchMoviesQueryDto): Promise<SearchMoviesResponse> {
        const {q, page} = SearchMoviesQuery.parse(query);
        try {
            return await request<SearchMoviesResponse>(`/search?q=${q}&page=${page}`);
        } catch (e: any) {
            // Provide a user-friendly message while preserving original
            const msg = e?.message || 'Failed to search for movies. Please try again later.';
            throw new Error(msg);
        }
    },

    async getFavorites(page: number = 1): Promise<SearchMoviesResponse> {
        assertPositivePage(page);
        try {
            return await request<SearchMoviesResponse>(`/favorites/list?page=${page}`);
        } catch (e: any) {
            const msg = e?.message || 'Failed to get favorites';
            throw new Error(msg);
        }
    },

    async addToFavorites(movie: Movie): Promise<void> {
        const validated = MovieSchema.parse(movie);
        try {
            await request<void>(`/favorites`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(validated),
            });
        } catch (e: any) {
            const msg = e?.message || 'Failed to add movie to favorites';
            throw new Error(msg);
        }
    },

    async removeFromFavorites(imdbID: string): Promise<void> {
        assertNonEmpty(imdbID, 'imdbID');
        try {
            await request<void>(`/favorites/${encodeURIComponent(imdbID)}`, {method: 'DELETE'});
        } catch (e: any) {
            const msg = e?.message || 'Failed to remove movie from favorites';
            throw new Error(msg);
        }
    },
};


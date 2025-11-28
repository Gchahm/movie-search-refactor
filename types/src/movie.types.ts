import {z} from 'zod';

export const MovieSchema = z.object({
    title: z.string(),
    imdbID: z.string(),
    year: z.string(),
    poster: z.string(),
})

export type Movie = z.infer<typeof MovieSchema>;

export const SearchMoviesQuery = z.object({
    q: z.string().transform(value => encodeURIComponent(value.trim())
    ),
    page: z.number().min(1).default(1),
});

export type SearchMoviesQueryDto = z.infer<typeof SearchMoviesQuery>;

export interface SearchMoviesResponse {
    data: {
        movies: Movie[];
        count: number;
        totalResults: number;
        currentPage: number;
        totalPages: number;
    };
}


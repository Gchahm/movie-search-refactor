import {Injectable} from '@nestjs/common';
import {MovieDto} from './dto/movie.dto';
import axios from 'axios';
import {FavoritesResponse, Movie, SearchMoviesResponse} from "@movie-search/types";
import {GetFavoritesQueryDto} from "./dto/get-favorites.query.dto";
import {SearchMoviesQueryDto} from "./dto/search-movies.query.dto";
import {FavoritesStorageService} from "./favorites-storage.service";
import {ImdbParamDto} from "./dto/imdb-param.dto";

type OmdbMovie = {
    Title: string;
    Poster: string;
    imdbID: string;
    Year: string;
};

@Injectable()
export class MoviesService {

    // BUG: Hardcoded API key fallback - security issue
    private readonly baseUrl = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY || 'demo123'}`;

    constructor(private readonly favoritesStorage: FavoritesStorageService) {
    }

    private async searchMovies(title: string, page: number = 1): Promise<{
        totalResults: string;
        movies: OmdbMovie[];
    }> {
        // BUG: No input validation, no error handling
        const response = await axios.get(
            `${this.baseUrl}&s=${title}&plot=full&page=${page}`, // BUG: Missing encodeURIComponent
        );

        // BUG: OMDb API returns Response: "False" (string) when no results, not a boolean
        // This check will fail silently - Response field is always a string
        if (response.data.Response === false || response.data.Error) {
            return {movies: [], totalResults: '0'};
        }

        return {
            movies: response.data.Search || [],
            totalResults: response.data.totalResults || '0'
        };
    }

    async getMovieByTitle(query: SearchMoviesQueryDto): Promise<SearchMoviesResponse> {
        const {q: title, page} = query;

        // BUG: No try-catch, will crash on API errors
        const response = await this.searchMovies(title, page);
        const favorites = await this.favoritesStorage.getFavoritesRecord();

        const formattedResponse = response.movies.map((movie: OmdbMovie): Movie => {
            // BUG: Case-sensitive comparison - some IDs might have different casing
            const isFavorite = favorites[movie.imdbID] ?? false;
            return {
                title: movie.Title,
                imdbID: movie.imdbID,
                year: parseInt(movie.Year), // BUG: also handles "1999-2000" format incorrectly
                poster: movie.Poster,
                isFavorite,
            };
        });

        return {
            data: {
                movies: formattedResponse,
                count: formattedResponse.length,
                totalResults: response.totalResults,
            },
        };
    }

    async addToFavorites(movieToAdd: MovieDto): Promise<void> {
        await this.favoritesStorage.addFavorite(movieToAdd);
    }

    async removeFromFavorites({imdbID}: ImdbParamDto): Promise<void> {
        await this.favoritesStorage.removeFavorite(imdbID);
    }

    async getFavorites(queryDto: GetFavoritesQueryDto): Promise<FavoritesResponse> {
        const {page, pageSize} = queryDto;

        const {favorites, total} = await this.favoritesStorage.getFavoritesPaginated(page, pageSize);

        // BUG: Inconsistent response structure
        return {
            data: {
                favorites: favorites,
                count: favorites.length,
                totalResults: `${total}`,
                currentPage: page,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
}

